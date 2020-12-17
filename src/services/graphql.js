const axios = require('axios');
const { port } = require('../config/vars');
const getToken = require('./keycloak');

const graphql = async (
  query,
  variables = {},
) => {
  const url = `http://localhost:${port}/cqdg/graphql`;
  const token = await getToken();
  const Authorization = `Bearer ${token}`;
  const config = { headers: { Authorization } };

  return await axios
    .post(url, { query, variables }, config)
    .then(response => response.data)
    .catch(err => {
      throw new Error(`Error querying arranger: ${err.message}`);
    });
};

module.exports = graphql;