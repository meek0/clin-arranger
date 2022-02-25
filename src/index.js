import "regenerator-runtime/runtime";

import ArrangerServer from "@arranger/server";
import { port, env } from "./config/vars";
import logger from "./config/logger";
import app from "./app.js";

const arrangerRoutes = await ArrangerServer.default({
  esHost: process.env.ES_HOST,
  esUser: process.env.ES_USER,
  esPass: process.env.ES_PASS,
})

app.use(arrangerRoutes);

app.listen(port, () =>
    logger.info(`Clin-Arranger server started on port ${port} (${env})`)
);