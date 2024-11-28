// import "regenerator-runtime/runtime";

import ArrangerServer from "@ferlab/arranger-server";
import {port, env, splitNestedDonorsOptimizationQuery} from "../config/vars.js";
import logger from "../config/logger.js";
import app from "./app.js";

import * as beforeES from './middlewares/beforeES/index.js'
import * as afterES from './middlewares/afterES/index.js'
import * as beforeAggrES from './middlewares/beforeAggrES/index.js'

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

app.listen(port, () =>
    logger.info(`Clin-Arranger server started on port ${port} (${env})`)
);
logger.info(`Split donors query enabled: ${splitNestedDonorsOptimizationQuery}`)