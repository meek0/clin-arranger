// import .env variables
require("dotenv-safe").config({
  allowEmptyValues: false,
  example: "./.env.example",
});

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5050,
  logs: process.env.NODE_ENV === "production" ? "combined" : "dev",
  logsRequestInterceptor: process.env.LOGS_REQUEST_INTERCEPTOR,
  authRealm: process.env.AUTH_REALM,
  authServerUrl: process.env.AUTH_SERVER_URL,
  authClientId: process.env.AUTH_CLIENT_ID,
  sessionSecret: process.env.SESSION_SECRET,
  serviceAccountClientId: process.env.SERVICE_ACCOUNT_CLIENT_ID,
  serviceAccountClientSecret: process.env.SERVICE_ACCOUNT_CLIENT_SECRET,
  indexNameGeneFeatureSuggestion: process.env.GENES_SUGGESTIONS_INDEX_NAME,
  indexNameVariantFeatureSuggestion: process.env.VARIANTS_SUGGESTIONS_INDEX_NAME,
  maxNOfGenomicFeatureSuggestions: process.env.MAX_NUMBER_OF_GF_SUGGESTIONS || 5,
  esHost: process.env.ES_HOST || 'http://localhost:9200/',
  esUser: process.env.ES_USER,
  esPass: process.env.ES_PASS,
  secure: "false" === process.env.SECURE ? false : true,
};
