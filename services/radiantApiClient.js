import axios from 'axios';
import { radiantApiUrl } from "../config/vars.js";
import logger from "../config/logger.js";

const radiantApiClient = axios.create({
    baseURL: radiantApiUrl
});

radiantApiClient.searchInterpretationByTypeAndAnalysisIds = async function(req, type, analysisId = []) {
    try {
        const ids = Array.from(new Set(analysisId)).join(',')
        const authorization = req.headers.authorization
        const response = await radiantApiClient.get(`/interpretations/${type}`, {
            params: {
                analysis_id: ids
            },
            headers: {
                Authorization: authorization
            }
        });
        const hashes = [];
        const interpretations = response.data || [];
        interpretations.forEach(item => {
            const hash = item.metadata?.variant_hash
            if (hash) {
                hashes.push(hash);
            }
        });
        logger.info(`Search interpretations by analysis IDs for: ${type} ${ids} => ${hashes}`);
        return interpretations;
    } catch (e) {
        logger.error(`Failed to search interpretations: ${e}`);
        return [];
    }
}

radiantApiClient.searchInterpretationByAnalysisIds = async function(req, analysisIds) {
    const iGermlinePromise = radiantApiClient.searchInterpretationByTypeAndAnalysisIds(req, 'germline', analysisIds);
    const iSomaticPromise = radiantApiClient.searchInterpretationByTypeAndAnalysisIds(req, 'somatic', analysisIds);
    const [interpretationsGermline, interpretationsSomatic] = await Promise.all([iGermlinePromise, iSomaticPromise]);
    return interpretationsGermline.concat(interpretationsSomatic);
}

radiantApiClient.fetchInterpretation = async function (
  req,
  type,
  sequencing_id,
  locus_id,
  transcript_id
) {
  try {
    const authorization = req.headers.authorization;
    const response = await radiantApiClient.get(
      `/interpretations/${type}/${sequencing_id}/${locus_id}/${transcript_id}`,
      {
        headers: {
          Authorization: authorization,
        },
      }
    );
    return response.data || "";
  } catch (e) {
    logger.error(`Failed to fetch interpretation: ${e}`);
    return "";
  }
};

export default radiantApiClient;