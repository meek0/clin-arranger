import {findSqonValueInQuery, DONORS_ANALYSIS_SERVICE_REQUEST_ID, DONORS_PATIENT_ID} from "../../utils.js"

const addAggsNested = (body, patient_id, analysis_id) => {
    const newBody = structuredClone(body)
    
    const addAggsNestedIds = (obj) => {
        for (var key in obj) {
            if (key.endsWith(':nested') && obj[key]?.nested?.path === 'donors') {
                const nestedAggs = structuredClone(obj[key].aggs)
                obj[key].aggs = {
                    filter_patient: {
                      filter: {
                        terms: {
                          [DONORS_PATIENT_ID]: [patient_id]
                        }
                      },
                      aggs: {
                        filter_analysis: {
                          filter: {
                            terms: {
                              [DONORS_ANALYSIS_SERVICE_REQUEST_ID]: [analysis_id]
                            }
                          },
                          aggs: nestedAggs
                        }
                      }
                    }
                }
            } else if (typeof obj[key] === 'object') {
                addAggsNestedIds(obj[key]);
            }
        }
        return null;
    }
    addAggsNestedIds(newBody.aggs);
     // keep original body for complex nested queries
    return newBody;
}

export default function (body) {
    const patient_id = findSqonValueInQuery(body.query, DONORS_PATIENT_ID)
    const analysis_id = findSqonValueInQuery(body.query, DONORS_ANALYSIS_SERVICE_REQUEST_ID)

    if(patient_id || analysis_id) {
       body = addAggsNested(body, patient_id, analysis_id)
       console.log('[nestedAggrDonors]', JSON.stringify(body))
    }

    return body
}