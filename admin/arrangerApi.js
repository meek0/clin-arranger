import { updateFieldExtendedMapping } from "@ferlab/arranger-admin/dist/schemas/ExtendedMapping/utils";
import {
  addArrangerProject,
  removeArrangerProject,
} from "@ferlab/arranger-admin/dist/schemas/ProjectSchema/utils";
import {
  getProjectMetadataEsLocation,
  createNewIndex,
} from "@ferlab/arranger-admin/dist/schemas/IndexSchema/utils";
import { constants } from "@ferlab/arranger-admin/dist/services/constants";

const createNewIndices = async (esClient, confIndices) => {
  const createNewIndexWithClient = createNewIndex(esClient);
  for (const confIndex of confIndices) {
    await createNewIndexWithClient({ ...confIndex });
  }
};

const fixExtendedMapping = async (esClient, confExtendedMappingMutations) => {
  const updateFieldExtendedMappingWithClient =
    updateFieldExtendedMapping(esClient);
  for (const confExtendedMappingMutation of confExtendedMappingMutations) {
    await updateFieldExtendedMappingWithClient({
      ...confExtendedMappingMutation,
    });
  }
};

export const ArrangerApi = {
  addArrangerProject,
  createNewIndices,
  fixExtendedMapping,
  getProjectMetadataEsLocation,
  removeArrangerProject,
  constants,
};
