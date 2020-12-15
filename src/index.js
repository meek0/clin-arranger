const { port, env } = require('../config/vars');
const logger = require('../config/logger');
const app = require('../config/express');
const regeneratorRuntime = require('regenerator-runtime/runtime');

app.listen(port, () => logger.info(`CQDG-Arranger server started on port ${port} (${env})`));

module.exports = app;