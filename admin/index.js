import "regenerator-runtime/runtime";
import EsInstance from "../services/esClient.js";
import { projectsConfig } from "./projectsConfig.js";
import logger from "../config/logger.js";
import { ArrangerApi } from "./arrangerApi.js";
import { createIndexIfNeeded, countNOfDocs } from "../services/esUtils.js";
import {
  indexNameVariants,
  indexNameSequencings,
  indexNameAnalyses,
  indexNameCnv,
  indexNameGenes,
} from "../config/vars.js";

const adminLogger = logger.child({
  defaultMeta: {
    location: "admin-project-script",
  },
});

const hasProjectArrangerMetadataIndex = async (esClient, projectName) => {
  const r = await esClient.indices.exists({
    index: ArrangerApi.getProjectMetadataEsLocation(projectName).index,
  });
  return !!r?.body;
};

const isProjectListedInArranger = async (esClient, projectName) => {
  const r = await esClient.exists({
    index: ArrangerApi.constants.ARRANGER_PROJECT_INDEX,
    id: projectName,
  });
  return !!r?.body;
};

const sameIndices = (xs, ys) => {
  const s = new Set(ys);
  return xs.length === ys.length && xs.every((x) => s.has(x));
};

//===== Start =====//
adminLogger.info(`Starting script`);

const projectIndices =
  [indexNameVariants, indexNameSequencings, indexNameAnalyses, indexNameCnv, indexNameGenes]
    ?.filter((p) => !!p)
    ?.map((p) => p?.trim()) ?? [];

if (projectIndices.length === 0) {
  adminLogger.warn(
    `Terminating. No indices needed to build a project was found in the env var 'PROJECT_INDICES'.`
  );
  process.exit(0);
}

const allProjectsConf = projectsConfig();

const projectsConf = allProjectsConf.filter((p) => {
  const indicesInConf = p.indices.map((i) => i.esIndex);
  return sameIndices(indicesInConf, projectIndices);
});

if (projectsConf.length === 0) {
  adminLogger.info("Terminating. Found no project configuration to process.");
  process.exit(0);
} else if (projectsConf.length > 1) {
  adminLogger.info(
    "Terminating. Found more than one candidates for project configurations. This is ambiguous."
  );
  process.exit(0);
}

const projectConf = projectsConf[0];

const client = EsInstance.getInstance();

const addArrangerProjectWithClient = ArrangerApi.addArrangerProject(client);

const hasCreatedIndex = await createIndexIfNeeded(
  client,
  ArrangerApi.constants.ARRANGER_PROJECT_INDEX
);
if (hasCreatedIndex) {
  adminLogger.info(
    `Created this index: '${ArrangerApi.constants.ARRANGER_PROJECT_INDEX}'. Since no existing arranger projects detected.`
  );
}

const projectName = projectConf.name;

const resolveSanityConditions = async () =>
  await Promise.all([
    hasProjectArrangerMetadataIndex(client, projectName),
    isProjectListedInArranger(client, projectName),
  ]);

const creationConditions = await resolveSanityConditions();
if (creationConditions.every((b) => !b)) {
  adminLogger.debug(
    `Creating a new metadata project since no existing project='${projectName}' detected.`
  );
  const addResp = await addArrangerProjectWithClient(projectName);
  adminLogger.debug(
    `(Project addition) received this response from arranger api: `,
    addResp
  );
  adminLogger.debug(
    `Creating these new graphql fields: ${projectConf.indices
      .map((i) => `'${i.graphqlField}' from es index '${i.esIndex}'`)
      .join(", ")}`
  );
  await ArrangerApi.createNewIndices(client, projectConf.indices);
} else if (creationConditions.some((b) => b !== creationConditions[0])) {
  adminLogger.warn(
    `The project seems to be in a weird state for '${projectName}' does ${
      creationConditions[0] ? "" : "not "
    }exist while it is ${creationConditions[1] ? "" : "not "}listed in ${
      ArrangerApi.constants.ARRANGER_PROJECT_INDEX
    }`
  );
}

const updateConditions = await resolveSanityConditions();
if (updateConditions.every((b) => b)) {
  const nOfDocsInProjectMetadata = await countNOfDocs(
    client,
    ArrangerApi.getProjectMetadataEsLocation(projectName).index
  );
  if (nOfDocsInProjectMetadata === projectConf.indices.length) {
    adminLogger.debug(`Applying extended mapping mutations.`);
    await ArrangerApi.fixExtendedMapping(
      client,
      projectConf.extendedMappingMutations
    );
  }
}

adminLogger.debug(`Terminating script.`);
process.exit(0);
