const {
  serviceAccountClientId,
  serviceAccountClientSecret,
  authServerUrl,
  authRealm,
} = require("../config/vars");
const axios = require("axios");
const qs = require("querystring");
const jwt = require("jsonwebtoken");
const logger = require("../config/logger");

let token;
let expiry;

const fetchAuthToken = async () => {
  const url = `${authServerUrl}/realms/${authRealm}/protocol/openid-connect/token`;
  const data = {
    grant_type: "client_credentials",
    client_id: serviceAccountClientId,
    client_secret: serviceAccountClientSecret,
  };
  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

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

const getPermissions = async (token) => {
  const formData = qs.stringify({
    audience: serviceAccountClientId,
    grant_type: "urn:ietf:params:oauth:grant-type:uma-ticket",
    response_mode: "permissions",
  });

  return await axios
    .post(
      `${authServerUrl}/realms/${authRealm}/protocol/openid-connect/token`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((response) => response.data)
    .catch((err) => undefined);
};

/*
 * permissions: the list of permissions returned by the getPermissions(accessToken) method above
 * resource: the name of id of the resource as defined in the Authorization section of the corresponding Keycloak client (env.SERVICE_ACCOUNT_CLIENT_ID).
 * */
const isPermissionGranted = (permissions, resource) => {
  if (permissions && permissions.length > 0) {
    for (let j = 0; j < permissions.length; j++) {
      let permission = permissions[j];
      if (permission.rsid === resource || permission.rsname === resource) {
        if (permission.scopes && permission.scopes.length > 0) {
          if (permission.scopes.includes("view")) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

module.exports = { getToken, getPermissions, isPermissionGranted };
