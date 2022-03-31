import "regenerator-runtime/runtime";
import app from "./app.js";
import adminGraphql from "@arranger/admin/dist";
import { esHost, esUser, esPass } from "./configs.js";

const PORT = 5050;

const adminApp = await adminGraphql.default({
  esHost,
  esPass,
  esUser,
});

adminApp.applyMiddleware({ app, path: "/admin/graphql" });

app.listen(PORT, () => {
  console.log(`⚡️⚡️⚡️ Admin API listening on port ${PORT} ⚡️⚡️⚡️`);
});
