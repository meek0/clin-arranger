// import "regenerator-runtime/runtime";

import ArrangerServer from "@ferlab/arranger-server";
import {port, env} from "../config/vars";
import logger from "../config/logger";
import app from "./app.js";

import * as beforeES from './middlewares/beforeES'
import * as afterES from './middlewares/afterES'

const arrangerRoutes = await ArrangerServer.default({
    esHost: process.env.ES_HOST,
    esUser: process.env.ES_USER,
    esPass: process.env.ES_PASS,
    middlewares: {
        preES: Object.values(beforeES),
        postES: Object.values(afterES)
    }
})

app.use(arrangerRoutes);

app.listen(port, () =>
    logger.info(`Clin-Arranger server started on port ${port} (${env})`)
);