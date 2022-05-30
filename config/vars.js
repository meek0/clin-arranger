import ds from "dotenv-safe";

ds.config({
  allowEmptyValues: false,
  example: "./.env.example",
});

export const env = process.env.NODE_ENV,
  port = process.env.PORT || 5050,
  logsRequestInterceptor = process.env.LOGS_REQUEST_INTERCEPTOR,//TODO env var
  authRealm = process.env.AUTH_REALM,
  authServerUrl = process.env.AUTH_SERVER_URL,
  authClientId = process.env.AUTH_CLIENT_ID,
  indexNameGeneFeatureSuggestion = process.env.GENES_SUGGESTIONS_INDEX_NAME,
  indexNameVariantFeatureSuggestion =
    process.env.VARIANTS_SUGGESTIONS_INDEX_NAME,
  maxNOfGenomicFeatureSuggestions =
    process.env.MAX_NUMBER_OF_GF_SUGGESTIONS || 5,
  esHost = process.env.ES_HOST || "http://localhost:9200/",
  esUser = process.env.ES_USER,
  esPass = process.env.ES_PASS,
  indexNameVariants = process.env.VARIANTS_INDEX_NAME,
  indexNameSequencings = process.env.SEQUENCINGS_INDEX_NAME,
  indexNamePrescriptions = process.env.PRESCRIPTIONS_INDEX_NAME;

export const rsPatient = "Patient";
export const rsServiceRequest = "ServiceRequest";
export const rsSVariants = "Variants";
export const prescriptions = "Prescriptions";
export const patients = "Patients";
export const variants = "Variants";
export const analyses = "Analyses"
export const sequencings = "Sequencings"
