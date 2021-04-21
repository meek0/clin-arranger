const express = require("express");
const {
  logsRequestInterceptor,
  authClientId,
  authRealm,
  authServerUrl,
  sessionSecret,
  secure,
} = require("./vars");
const logger = require("./logger");
const bodyParser = require("body-parser");
const Keycloak = require("keycloak-connect");
const cors = require("cors");
const session = require("express-session");
const statistics = require("../controllers/statistics");
const { getPermissions, isPermissionGranted } = require("../services/keycloak");

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
  app.use(function (req, res, next) {
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

  app.use("/cqdg/graphql", keycloak.protect(), function (req, res, next) {
    next();
  });

  //--------------------------------- Permission Proof of Concept
  const testPermissions = async (req, res, next) => {
    try{
      const permissions = await getPermissions(
          req.kauth.grant.access_token.token
      );

      if (isPermissionGranted(permissions, req.params.fileId)) {
        res.status(200).json({ access: "granted" });
      } else {
        return keycloak.accessDenied(req, res, next);
      }
    }catch(err){
      return keycloak.accessDenied(req, res, next);
    }
  };

  app.get("/files/:fileId", testPermissions);

  // Using the keycloak.enforcer, we cannot dynamically pass the resource
  /*app.get(
    "/files/:fileId",
    keycloak.enforcer(["FI000004:view"], {
      resource_server_id: "cqdg-system",
      response_mode: "permissions",
    }),
    function (req, res) {
      res.status(200).json({ status: "granted" });
    }
  );*/
}

// Routes
app.get("/stats", statistics);

module.exports = app;
