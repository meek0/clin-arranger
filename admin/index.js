import "regenerator-runtime/runtime";
import EsInstance from "../services/esClient.js";
import { projectsConfig } from "./projectsConfig.js";
import logger from "../config/logger.js";
import { ArrangerApi } from "./arrangerApi.js";
import { createIndexIfNeeded, countNOfDocs } from "../services/esUtils.js";

const adminLogger = logger.child({
  defaultMeta: {
    location: "admin-script",
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

//===== Start =====//
adminLogger.info(`Starting script)`);

const projectsConf = projectsConfig();

if (projectsConf.length === 0) {
  adminLogger.info("Found no projects to process. Exiting.");
  process.exit(0);
}

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

for (const projectConf of projectsConf) {
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
}

adminLogger.debug(`Ending script.`);
process.exit(0);
