import express from "express";
import {authClientId, authRealm, authServerUrl, logsRequestInterceptor,} from "./vars";
import logger from "./logger";
import bodyParser from "body-parser";
import Keycloak from "keycloak-connect";
import cors from "cors";
import genomicFeatureSuggestions, {SUGGESTIONS_TYPES,} from "../controllers/genomicFeatureSuggestions";

const app = express();

app.use(bodyParser.json({limit: "4MB"}));

app.use(cors());

if (logsRequestInterceptor === "true") {
    app.use((req, res, next) => {
        logger.info("REQ: ", req.body);
        next();
    });
}

const keycloak = new Keycloak({}, {
    clientId: authClientId,
    bearerOnly: true,
    serverUrl: authServerUrl,
    realm: authRealm,
});

app.use(keycloak.middleware());


app.get("/genesFeature/suggestions/:prefix", keycloak.protect(), (req, res) =>
    genomicFeatureSuggestions(req, res, SUGGESTIONS_TYPES.GENE)
);

app.get("/variantsFeature/suggestions/:prefix", keycloak.protect(), (req, res) =>
    genomicFeatureSuggestions(req, res, SUGGESTIONS_TYPES.VARIANT)
);

app.all("*", keycloak.protect(), (req, res, next) => {
    next()
});

export default app;
