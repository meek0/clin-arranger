const DONORS_PATIENT_ID = 'donors.patient_id';
const DONORS_ANALYSIS_SERVICE_REQUEST_ID = 'donors.analysis_service_request_id';

const findSqonValueInQuery = (obj, fieldName) => {
    for (var key in obj) {
        if (key === fieldName) {
            return obj[key][0];
        } else if (typeof obj[key] === 'object') {
            var result = findSqonValueInQuery(obj[key], fieldName);
            if (result !== null) {
                return result;
            }
        }
    }
    return null;
}

const replaceSqonSort = (sort, sortedField, patientId, analysisId) => {
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
            if(patient_id || analysis_id) {
                return replaceSqonSort(sort, field, patient_id, analysis_id);
            }
        }
        return sort
    })
    // console.log('new ES body', JSON.stringify(body))
    return body
}