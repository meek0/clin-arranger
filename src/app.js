import express from "express";
import {
  authClientId,
  authRealm,
  authServerUrl,
  logsRequestInterceptor,
  useSecurity,
} from "./config/vars.js";
import logger from "./config/logger.js";
import bodyParser from "body-parser";
import Keycloak from "keycloak-connect";
import cors from "cors";
import genomicSuggestionsHandler, {
  SUGGESTIONS_TYPES,
} from "./controllers/genomicSuggestionsHandler.js";

import arrangerGqlSecurityHandler from "./controllers/arrangerGqlSecurityHandler.js";
import arrangerRoutesHandler from "./controllers/arrangerRoutesHandler.js";
import transcriptsReportHandler from "./controllers/transcriptsReportHandler.js";
import { sendForbidden } from "./httpUtils.js";
import patientSecurityHandler from "./controllers/patientSecurityHandler.js";
const app = express();

app.use(bodyParser.json({ limit: "4MB" }));

app.use(cors());

if (logsRequestInterceptor === "true") {
  app.use((req, res, next) => {
    logger.info("REQ: ", req.body);
    next();
  });
}

const keycloak = new Keycloak(
  {},
  {
    clientId: authClientId,
    bearerOnly: true,
    serverUrl: authServerUrl,
    realm: authRealm,
  }
);

keycloak.accessDenied = (_, res) => sendForbidden(res);

app.use(keycloak.middleware());

app.get(
  "/report/transcripts/:patientId/:variantId",
  keycloak.protect(),
  patientSecurityHandler,
  transcriptsReportHandler
);

app.get("/genesFeature/suggestions/:prefix", keycloak.protect(), (req, res) =>
  genomicSuggestionsHandler(req, res, SUGGESTIONS_TYPES.GENE)
);

app.get(
  "/variantsFeature/suggestions/:prefix",
  keycloak.protect(),
  (req, res) => genomicSuggestionsHandler(req, res, SUGGESTIONS_TYPES.VARIANT)
);

if (useSecurity) {
  //Only forward
  // 1) HTTP POST and GET methods
  // 2) /<project-id>/graphql and /<project-id>/ping routes
  // to arranger server
  //note: do not keycloak protect GET routes above since
  // we want to be able to easily ping arranger and have a graphql playground
  app.all("*", arrangerRoutesHandler);

  app.post("*", keycloak.protect(), arrangerGqlSecurityHandler);
}

export default app;
