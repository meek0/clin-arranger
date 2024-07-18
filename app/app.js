import express from "express";
import { authClientId, authRealm, authServerUrl } from "../config/vars.js";
import bodyParser from "body-parser";
import Keycloak from "keycloak-connect";
import compression from "compression";
import cors from "cors";
import genomicSuggestionsHandler, {
  SUGGESTIONS_TYPES,
} from "./controllers/genomicSuggestionsHandler.js";
import {searchHPOAutocomplete, searchHPODescendants, searchHPOAncestors, countHPO} from "./controllers/hpoHandler.js";
import arrangerGqlSecurityHandler from "./controllers/arrangerGqlSecurityHandler.js";
import arrangerRoutesHandler from "./controllers/arrangerRoutesHandler.js";
import transcriptsReportHandler from "./controllers/transcriptsReportHandler.js";
import { sendForbidden } from "./httpUtils.js";
import { VARIANTS_READ_PERMISSION_ENFORCER, HPO_READ_PERMISSION_ENFORCER } from "./permissionsUtils.js";
import variantDonorsHandler from "./controllers/variantDonorsHandler.js"
import booleanFilterMiddleware from './middlewares/booleanFilterMiddleware.js'

const app = express();

app.use(compression())

app.use(bodyParser.json({ limit: "4MB" }));

app.use(cors({
    exposedHeaders: ['Authorization']
}));

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

app.get("/health", async (req, res) => {
  res.status(200).send({
    status: "UP",
  });
});

app.get(
  "/report/transcripts/:patientId/:variantId",
  keycloak.enforcer(VARIANTS_READ_PERMISSION_ENFORCER),
  cors({
    exposedHeaders: ["Content-Disposition"],
  }),
  transcriptsReportHandler
);

app.get(
  "/genesFeature/suggestions/:prefix",
  keycloak.enforcer(VARIANTS_READ_PERMISSION_ENFORCER),
  (req, res) => genomicSuggestionsHandler(req, res, SUGGESTIONS_TYPES.GENE)
);

app.get(
  "/variantsFeature/suggestions/:prefix",
  keycloak.enforcer(VARIANTS_READ_PERMISSION_ENFORCER),
  (req, res) => genomicSuggestionsHandler(req, res, SUGGESTIONS_TYPES.VARIANT)
);

app.get(
  "/hpo/autocomplete",
  keycloak.enforcer(HPO_READ_PERMISSION_ENFORCER),
  (req, res) => searchHPOAutocomplete(req, res)
);

app.get(
  "/hpo/descendants",
  keycloak.enforcer(HPO_READ_PERMISSION_ENFORCER),
  (req, res) => searchHPODescendants(req, res)
);

app.get(
  "/hpo/count",
  keycloak.enforcer(HPO_READ_PERMISSION_ENFORCER),
  (req, res) => countHPO(req, res)
);

app.get(
  "/hpo/ancestors",
  keycloak.enforcer(HPO_READ_PERMISSION_ENFORCER),
  (req, res) => searchHPOAncestors(req, res)
);

//Only forward
// 1) HTTP POST and GET methods
// 2) /<project-id>/graphql and /<project-id>/ping routes
// to arranger server
//note: do not keycloak protect GET routes above since
// we want to be able to easily ping arranger and have a graphql playground
app.all("*", arrangerRoutesHandler);

app.post("*", keycloak.protect(), arrangerGqlSecurityHandler);

app.use(variantDonorsHandler)

app.use(booleanFilterMiddleware)

export default app;
