import "regenerator-runtime/runtime";
import app from "./app.js";
import adminGraphql from "@arranger/admin/dist";
import {
  ES_HOST,
  ES_USER,
  ES_PASS,
} from "@arranger/server/dist/utils/config.js";

const PORT = 5050;

const adminApp = await adminGraphql.default({
  esHost: ES_HOST,
  esPass: ES_PASS,
  esUser: ES_USER,
});

adminApp.applyMiddleware({ app, path: "/admin/graphql" });

app.listen(PORT, () => {
  console.log(`⚡️⚡️⚡️ Admin API listening on port ${PORT} ⚡️⚡️⚡️`);
});
