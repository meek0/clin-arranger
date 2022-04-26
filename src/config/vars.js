import ds from "dotenv-safe";

ds.config({
  allowEmptyValues: false,
  example: "./.env.example",
});

const isProd = process.env.NODE_ENV === "production";

export const env = process.env.NODE_ENV,
  port = process.env.PORT || 5050,
  logs = isProd ? "combined" : "dev",
  logsRequestInterceptor = process.env.LOGS_REQUEST_INTERCEPTOR,
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
  useSecurity = process.env.USE_SECURITY !== "false",
  indexNamePatients = process.env.PATIENTS_INDEX_NAME,
  indexNameVariants = process.env.VARIANTS_INDEX_NAME,
  indexNamePrescriptions = process.env.PRESCRIPTIONS_INDEX_NAME;

export const rsPatient = "Patient"
export const rsServiceRequest = "ServiceRequest"
export const prescriptions = "Prescriptions";
export const patients = "Patients";