const express = require('express');
const passport = require('passport');
const { logs } = require('./vars');
const strategies = require('./passport');
const Arranger = require('@arranger/server');

const app = express();

app.use(passport.initialize());
passport.use('jwt', strategies.jwt);

const router = async () => {
  try{
    console.log("BOOYAAA!");
    const arrangerRouter = new Arranger({
      esHost: "http://localhost:9200"
    });
    console.log(arrangerRouter);
    return arrangerRouter;
  }catch(error){
    console.log("ERROR initializing Arranger: ", error);
    return null;
  }

}
app.use(router);

module.exports = app;