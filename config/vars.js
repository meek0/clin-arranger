const path = require('path');

// import .env variables
require('dotenv-safe').config({
  allowEmptyValues: true,
  example: './.env.example'
});

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
};