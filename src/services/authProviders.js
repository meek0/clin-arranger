exports.jwt = async (token) => {
  //TODO: validate token - get script from clin-proxy-api
  console.log("TOKEN: ", token);

  return {
    service: 'keycloak',
    id: '123',
    name: 'Patrice Laplante',
    email: 'plaplante@ferlab.bio'
  }
}