import express from "express";
import {
  logsRequestInterceptor,
  authClientId,
  authRealm,
  authServerUrl,
  sessionSecret,
  secure,
} from "./vars";
import logger from "./logger";
import bodyParser from "body-parser";
import Keycloak from "keycloak-connect";
import cors from "cors";
import session from "express-session";
import statistics from "../controllers/statistics";
import requestAccessByStudyId from "../controllers/requestAccess";
import downloadManifestByStudyId from "../controllers/downloadManifest";
import { getPermissions, isPermissionGranted } from "../services/keycloak";
import genomicFeatureSuggestions, {
  SUGGESTIONS_TYPES,
} from "../controllers/genomicFeatureSuggestions";

/**
 * N.B.: The memory store is not scalable and the documentation states that there is a memory leak.
 * Consequently, this is not suited for production use.
 * Eventually replace with https://github.com/tj/connect-redis
 **/
const memoryStore = new session.MemoryStore();

const app = express();

app.use(bodyParser.json({ limit: "4MB" }));
app.use(cors());

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

// Request Logging Interceptor
if (logsRequestInterceptor === "true") {
  app.use((req, res, next) => {
    logger.info("REQ: ", req.body);
    next();
  });
}

if (true === secure) {
  // Initialize Keycloak middleware
  const keycloakConfig = {
    clientId: authClientId,
    bearerOnly: true,
    serverUrl: authServerUrl,
    realm: authRealm,
  };

  const keycloakOptions = {
    store: memoryStore,
  };

  const keycloak = new Keycloak(keycloakOptions, keycloakConfig);
  app.use(keycloak.middleware());

  app.all("/request/*", keycloak.protect(), (req, res, next) => {
    req.userToken = req.kauth.grant.access_token.token;
    next();
  });

  app.use("/clin/graphql", keycloak.protect(), (req, res, next) => {
    next();
  });

  //--------------------------------- Permission Proof of Concept
  const testPermissions = async (req, res, next) => {
    try {
      const permissions = await getPermissions(
        req.kauth.grant.access_token.token
      );

      if (isPermissionGranted(permissions, req.params.fileId)) {
        res.status(200).json({ access: "granted" });
      } else {
        return keycloak.accessDenied(req, res, next);
      }
    } catch (err) {
      return keycloak.accessDenied(req, res, next);
    }
  };

  app.get("/files/:fileId", testPermissions);
  app.get("/request/access/:studyId", requestAccessByStudyId);
  app.get("/request/manifest/:studyId", downloadManifestByStudyId);

  // Variant and Gene Suggestions
  app.get("/request/genesFeature/suggestions/:prefix", (req, res) =>
    genomicFeatureSuggestions(req, res, SUGGESTIONS_TYPES.GENE)
  );

  app.get("/request/variantsFeature/suggestions/:prefix", (req, res) =>
    genomicFeatureSuggestions(req, res, SUGGESTIONS_TYPES.VARIANT)
  );
  
  // Using the keycloak.enforcer, we cannot dynamically pass the resource
  /*app.get(
    "/files/:fileId",
    keycloak.enforcer(["FI000004:view"], {
      resource_server_id: "clin-system",
      response_mode: "permissions",
    }),
    function (req, res) {
      res.status(200).json({ status: "granted" });
    }
  );*/
}

// Routes
app.get("/stats", statistics);

export default app;
