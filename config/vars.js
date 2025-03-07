import ds from "dotenv-safe";

ds.config({
  allowEmptyValues: false,
  example: "./.env.example",
});

export const env = process.env.NODE_ENV,
  logLevel = process.env.LOG_LEVEL || "info",
  port = process.env.PORT || 5050,
  authRealm = process.env.AUTH_REALM,
  authServerUrl = process.env.AUTH_SERVER_URL,
  authClientId = process.env.AUTH_CLIENT_ID,
  indexNameGeneFeatureSuggestion = process.env.GENES_SUGGESTIONS_INDEX_NAME,
  indexNameVariantFeatureSuggestion =
    process.env.VARIANTS_SUGGESTIONS_INDEX_NAME,
  indexNameHPO = process.env.HPO_INDEX_NAME,
  indexNameMONDO = process.env.MONDO_INDEX_NAME,
  maxNOfGenomicFeatureSuggestions =
    process.env.MAX_NUMBER_OF_GF_SUGGESTIONS || 5,
  esHost = process.env.ES_HOST || "http://localhost:9200/",
  esUser = process.env.ES_USER,
  esPass = process.env.ES_PASS,
  indexNameVariants = process.env.VARIANTS_INDEX_NAME,
  indexNameCnv = process.env.CNV_INDEX_NAME,
  indexNameGenes = process.env.GENES_INDEX_NAME,
  indexNameSequencings = process.env.SEQUENCINGS_INDEX_NAME,
  indexNameAnalyses = process.env.ANALYSES_INDEX_NAME,
  indexNameCoverageByGene = process.env.COVERAGE_BY_GENE_INDEX_NAME,
  usersApiUrl = process.env.USERS_API_URL,
  fhirUrl = process.env.FHIR_URL,
  radiantApiUrl = process.env.RADIANT_API_URL;

export const rsServiceRequest = "ServiceRequest";
export const rsSVariants = "Variants";
export const variants = "Variants";
export const analyses = "Analyses";
export const sequencings = "Sequencings";
export const cnv = "cnv";
export const genes = "Genes";
export const coverages = "Coverages";
