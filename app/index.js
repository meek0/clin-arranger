// import "regenerator-runtime/runtime";

import {port, env} from "../config/vars.js";
import logger from "../config/logger.js";
import app from "./app.js";

app.listen(port, () =>
    logger.info(`Clin-Arranger server started on port ${port} (${env})`)
);