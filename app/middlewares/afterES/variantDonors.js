import logger from "../../../config/logger.js";
import { splitNestedDonorsOptimizationQuery, indexNameVariants } from "../../../config/vars.js";
import EsInstance from "../../../services/esClient.js";
import {findSqonValueInQuery, DONORS_ANALYSIS_SERVICE_REQUEST_ID, DONORS_PATIENT_ID, DONORS_BIOINFO_ANALYSIS_CODE} from "../../utils.js"

const esClient = EsInstance.getInstance();

const buildNestedDonorsQuery = (patient_id, analysis_id, bioinfo_analysis_code) => {
    const must = []
    const addTerm = (field, value) => {
        if (value) {
            must.push({
                terms: {
                    [field]: [value]
                }
            })
        }
    }
    addTerm("donors.patient_id", patient_id)
    addTerm("donors.analysis_service_request_id", analysis_id)
    addTerm("donors.bioinfo_analysis_code", bioinfo_analysis_code)
    return must;
}

// extract the inner_hits from ES response if available and copy its content where is should be normally:
// - inner_hits.donors (is from beforeES/nestedDonors)
// - (add more inner_hits bellow ...)
export default async function (body, hits) {

    if (splitNestedDonorsOptimizationQuery) {
        
        const patient_id = findSqonValueInQuery(body.query, DONORS_PATIENT_ID)
        const analysis_id = findSqonValueInQuery(body.query, DONORS_ANALYSIS_SERVICE_REQUEST_ID)
        const bioinfo_analysis_code = findSqonValueInQuery(body.query, DONORS_BIOINFO_ANALYSIS_CODE)

        if (patient_id || analysis_id || bioinfo_analysis_code) {
            const ids = hits?.hits?.map(hit => hit._id) || []
            if (ids.length) {

                const esBody = {
                    query: {
                      bool: {
                        must: [
                          {
                            terms: {
                              _id: ids,
                            },
                          },
                          {
                            nested: {
                              path: "donors",
                              query: {
                                bool: {
                                  must: buildNestedDonorsQuery(
                                    patient_id,
                                    analysis_id,
                                    bioinfo_analysis_code
                                  ),
                                },
                              },
                              inner_hits: {
                                _source: ["donors.*"],
                              },
                            },
                          },
                        ]
                      }
                    },
                    _source: {
                        includes: [
                            "*"
                        ],
                        excludes: [
                            "donors"
                        ]
                    }
                  }
                  

                logger.debug(`[variantDonors] Un-Split donors ES query: ${JSON.stringify(esBody)}`)
                
                const result = await esClient.search({
                    index: indexNameVariants,
                    size: ids.length,
                    body: esBody,
                })

                hits.hits?.forEach((hit) => {
                    const newHit = result.body?.hits?.hits?.find(h => h._id === hit._id)
                    if (newHit) {
                        hit._source = structuredClone(newHit._source)
                        hit.inner_hits = structuredClone(newHit.inner_hits)
                    } else {
                        logger.warn(`[variantDonors] No Un-split hit found for id: ${hit._id}`)
                    }
                });
               
            }
        }
    }
   
    if (hits?.hits) {
        hits.hits?.forEach((hit) => {
            if (hit?.inner_hits) {
                const innerHitsDonors = hit?.inner_hits?.donors?.hits?.hits?.map((h)=> h._source)
                // don't replace donors if already exist for complex nested queries
                if (hit._source?.donors?.length) {
                    console.warn('[variantDonors]', hit._source?.donors?.length, innerHitsDonors.length)
                }
                if (innerHitsDonors?.length && !hit._source?.donors) {
                    hit._source.donors = structuredClone(innerHitsDonors);
                } 
                delete hit.inner_hits;
            }
        });
       // console.log('[variantDonors]', hits) 
    }
    return hits;
}