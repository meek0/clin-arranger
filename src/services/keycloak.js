const { serviceAccountClientId, serviceAccountClientSecret, authServerUrl, authRealm } = require('../config/vars');
const axios = require('axios');
const qs = require('querystring')
const jwt = require('jsonwebtoken');

let token;
let expiry;

const fetchAuthToken = async () => {
  const url = `${authServerUrl}/realms/${authRealm}/protocol/openid-connect/token`;
  const data = {
    grant_type: 'client_credentials',
    client_id: serviceAccountClientId,
    client_secret: serviceAccountClientSecret
  }
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  return await axios
    .post(url, qs.stringify(data), config)
    .then((response) => response.data.access_token)
    .catch((err) => {
      throw new Error(`Error authenticating with Keycloak: ${err.message}`);
    });
};

const isTokenExpired = () => {
  return !expiry || Date.now() > expiry;
};

const getToken = async () => {
  if (!token || isTokenExpired()) {
    token = await fetchAuthToken();
    expiry = jwt.decode(token).exp * 1000;
  }
  return token;
};

module.exports = getToken;