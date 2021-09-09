const axios = require("axios");
const { port } = require("../config/vars");
const { getToken } = require("./keycloak");
const logger = require("../config/logger");

const graphql = async (query, variables = {}, userToken = null) => {
  const url = `http://localhost:${port}/clin/graphql`;
  const token = userToken || await getToken();
  const Authorization = `Bearer ${token}`;
  const config = { headers: { Authorization } };

  return await axios
    .post(url, { query, variables }, config)
    .then((response) => response.data)
    .catch((err) => {
      logger.error("Request to ES failed.", err);
    });
};

module.exports = graphql;
