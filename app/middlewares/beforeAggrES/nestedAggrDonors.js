import {findSqonValueInQuery, DONORS_ANALYSIS_SERVICE_REQUEST_ID, DONORS_PATIENT_ID, DONORS_BIOINFO_ANALYSIS_CODE} from "../../utils.js"

const addAggsNested = (body, patient_id, analysis_id, bioinfo_analysis_code) => {
    const newBody = structuredClone(body)

    const buildFilter = (aggs) => {
      return {
        filter_patient: {
          filter: {
            terms: {
              [DONORS_PATIENT_ID]: [patient_id]
            }
          },
          aggs:analysis_id ?  {
              filter_analysis: {
                filter: {
                  terms: {
                    [DONORS_ANALYSIS_SERVICE_REQUEST_ID]: [analysis_id]
                  }
                },
                aggs: bioinfo_analysis_code ?  {
                  filter_bioinfo: {
                    filter: {
                      terms: {
                        [DONORS_BIOINFO_ANALYSIS_CODE]: [bioinfo_analysis_code]
                      }
                    },
                    aggs: aggs
                  }
                } : aggs
              }
            } : aggs
          }
        }
    }
    
    const addAggsNestedIds = (obj) => {
        for (var key in obj) {
            if (key.endsWith(':nested') && obj[key]?.nested?.path === 'donors') {
                const nestedAggs = structuredClone(obj[key].aggs)
                obj[key].aggs = buildFilter(nestedAggs)
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
    const bioinfo_analysis_code = findSqonValueInQuery(body.query, DONORS_BIOINFO_ANALYSIS_CODE)

    if(patient_id || analysis_id || bioinfo_analysis_code) {
       body = addAggsNested(body, patient_id, analysis_id, bioinfo_analysis_code)
       // console.log('[nestedAggrDonors]', JSON.stringify(body))
    }

    return body
}