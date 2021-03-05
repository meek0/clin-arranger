import "core-js/stable";
import "regenerator-runtime/runtime";

import Arranger from '@arranger/server';
const { port, env } = require('./config/vars');
const logger = require('./config/logger');
const app = require('./config/express');

Arranger({
  esHost: "http://localhost:9200",
  // Maybe the following could come in handy later on...
  /*getServerSideFilter: () => ({
    op: 'not',
    content: [
      {
        op: 'in',
        content: {
          field: 'access_denied',
          value: ['true'],
        },
      },
    ]
  })*/
}).then(router => {
  app.use(router);
  app.listen(port, () => logger.info(`CQDG-Arranger server started on port ${port} (${env})`));
})

module.exports = app;

//netstat -ano -p tcp | grep 5050