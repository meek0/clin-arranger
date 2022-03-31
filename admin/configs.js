import ds from "dotenv-safe";

ds.config({
    allowEmptyValues: false,
});

export const esHost =  process.env.ES_HOST
export const esPass =  process.env.ES_PASS
export const esUser =  process.env.ES_USER