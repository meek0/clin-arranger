import {findSqonValueInQuery, DONORS_ANALYSIS_SERVICE_REQUEST_ID, DONORS_PATIENT_ID, DONORS_BIOINFO_ANALYSIS_CODE} from "../../utils.js"

const replaceSqonSort = (sort, sortedField, patientId, analysisId, bioinfo_analysis_code) => {
    const newSort = structuredClone(sort)
    const newFilter =[]
    if(patientId){
        newFilter.push(
            {
                term: {
                    [DONORS_PATIENT_ID]: patientId
                }
            },
        )
    }
    if(analysisId){
        newFilter.push(
            {
                term: {
                    [DONORS_ANALYSIS_SERVICE_REQUEST_ID]: analysisId
                }
            },
        )
    }
    if(bioinfo_analysis_code){
        newFilter.push(
            {
                term: {
                    [DONORS_BIOINFO_ANALYSIS_CODE]: bioinfo_analysis_code
                }
            },
        )
    }
    newSort[sortedField].nested.filter =  {
        bool: {
          must: newFilter
        }
      }
    return newSort
}

export default function (body) {
    body.sort = body.sort?.map( (sort) => {
        const field = Object.keys(sort)[0]
        if (field === 'gene' && JSON.stringify(body).includes('nested')) {
            return {
                'consequences.symbol': {
                    missing: sort[field].missing,
                    order: sort[field].order,
                    nested: {
                        path: "consequences",
                        filter: {
                            "term": {
                                "consequences.picked": true
                            }
                        }
                    }
                }
            }
        }
        if(sort[field].nested && sort[field].nested.path && sort[field].nested.path === 'donors') {
            const patient_id = findSqonValueInQuery(body.query, DONORS_PATIENT_ID)
            const analysis_id = findSqonValueInQuery(body.query, DONORS_ANALYSIS_SERVICE_REQUEST_ID)
            const bioinfo_analysis_code = findSqonValueInQuery(body.query, DONORS_BIOINFO_ANALYSIS_CODE)
            
            if(patient_id || analysis_id || bioinfo_analysis_code) {
                return replaceSqonSort(sort, field, patient_id, analysis_id, bioinfo_analysis_code);
            }
        }
        return sort
    })
    // console.log('[nestedSort]', JSON.stringify(body))
    return body
}