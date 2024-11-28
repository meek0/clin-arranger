import { splitNestedDonorsOptimizationQuery, indexNameVariants } from "../../../config/vars.js";
import EsInstance from "../../../services/esClient.js";
import {findSqonValueInQuery, DONORS_ANALYSIS_SERVICE_REQUEST_ID, DONORS_PATIENT_ID, DONORS_BIOINFO_ANALYSIS_CODE} from "../../utils.js"

const esClient = EsInstance.getInstance();

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
                            bool: {
                            must: [
                                {
                                    terms: {
                                        "_id": ids
                                    }
                                },
                                {
                                nested: {
                                    path: "donors",
                                    query: {
                                    bool: {
                                        must: [
                                        patient_id && {
                                            terms: {
                                            "donors.patient_id": [
                                                patient_id
                                            ],
                                            }
                                        },
                                        analysis_id &&{
                                            terms: {
                                            "donors.analysis_service_request_id": [
                                                analysis_id
                                            ],
                                            }
                                        },
                                        bioinfo_analysis_code && {
                                            terms: {
                                            "donors.bioinfo_analysis_code": [
                                                bioinfo_analysis_code
                                            ],
                                            }
                                        }
                                        ]
                                    }
                                    },
                                    inner_hits: {
                                        _source: [
                                            "donors.*"
                                        ]
                                    }
                                }
                                }
                            ]
                            }
                        }
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