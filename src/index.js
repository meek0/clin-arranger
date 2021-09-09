import "core-js/stable";
import "regenerator-runtime/runtime";

import Arranger from "@arranger/server";
import { port, env } from "./config/vars";
import logger from "./config/logger";
import app from "./config/express";

Arranger({
  esHost: process.env.ES_HOST,
}).then((router) => {
  app.use(router);
  app.listen(port, () =>
    logger.info(`Clin-Arranger server started on port ${port} (${env})`)
  );
});
