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
import {searchMONDOAutocomplete} from "./controllers/mondoHandler.js";
import arrangerGqlSecurityHandler from "./controllers/arrangerGqlSecurityHandler.js";
import arrangerRoutesHandler from "./controllers/arrangerRoutesHandler.js";
import { singleVariantReport, multiVariantReport } from "./controllers/transcriptsReportHandler.js";
import { sendForbidden } from "./httpUtils.js";
import { VARIANTS_READ_PERMISSION_ENFORCER, HPO_READ_PERMISSION_ENFORCER } from "./permissionsUtils.js";
import beforeSendHandler from "./controllers/beforeSendHandler.js"
import booleanFilterMiddleware from './middlewares/booleanFilterMiddleware.js'
import variantPropertiesFilterMiddleware from './middlewares/variantPropertiesFilterMiddleware.js'
import logger from "../config/logger.js";
import * as beforeES from './middlewares/beforeES/index.js'
import * as afterES from './middlewares/afterES/index.js'
import * as beforeAggrES from './middlewares/beforeAggrES/index.js'
import ArrangerServer from "@ferlab/arranger-server";

const app = express();

app.use(compression())

app.use(bodyParser.json({ limit: "4MB" }));

app.use(cors());

const keycloak = new Keycloak(
  {},
  {
    clientId: authClientId,
    bearerOnly: true,
    serverUrl: authServerUrl,
    realm: authRealm,
  }
);

keycloak.accessDenied = (_, res) => sendForbidden(res)

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
  singleVariantReport
);

app.get(
  "/report/transcripts/:patientId/",
  keycloak.enforcer(VARIANTS_READ_PERMISSION_ENFORCER),
  cors({
    exposedHeaders: ["Content-Disposition"],
  }),
  multiVariantReport
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
  searchHPOAutocomplete
);

app.get(
  "/mondo/autocomplete",
  keycloak.enforcer(HPO_READ_PERMISSION_ENFORCER),
  searchMONDOAutocomplete
);

app.get(
  "/hpo/descendants",
  keycloak.enforcer(HPO_READ_PERMISSION_ENFORCER),
  searchHPODescendants
);

app.get(
  "/hpo/count",
  keycloak.enforcer(HPO_READ_PERMISSION_ENFORCER),
  countHPO
);

app.get(
  "/hpo/ancestors",
  keycloak.enforcer(HPO_READ_PERMISSION_ENFORCER),
  searchHPOAncestors
);

//Only forward
// 1) HTTP POST and GET methods
// 2) /<project-id>/graphql and /<project-id>/ping routes
// to arranger server
//note: do not keycloak protect GET routes above since
// we want to be able to easily ping arranger and have a graphql playground
app.all("*", arrangerRoutesHandler);

app.post("*", keycloak.protect(), arrangerGqlSecurityHandler);

app.use(beforeSendHandler)
app.use(booleanFilterMiddleware)
app.use(variantPropertiesFilterMiddleware)

const arrangerRoutes = await ArrangerServer.default({
    esHost: process.env.ES_HOST,
    esUser: process.env.ES_USER,
    esPass: process.env.ES_PASS,
    middlewares: {
        preES: Object.values(beforeES),
        postES: Object.values(afterES),
        preAggrES: Object.values(beforeAggrES),
    }
})

app.use(arrangerRoutes);

app.use((error, req, res, next) => {
  logger.error(error.message)
  res.status(500).json({
    error: error.constructor.name,
    message: error.message
  })
})

export default app;
