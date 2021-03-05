const path = require("path");

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
  secure: "false" === process.env.SECURE ? false : true,
};
