const BearerStrategy = require('passport-http-bearer');
const authProviders = require('../src/services/authProviders');

exports.jwt = new BearerStrategy(async (token, done) => {
  try {
    const user = await authProviders['jwt'](token);

    if (user) {
      return done(null, user);
    }else{
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
});