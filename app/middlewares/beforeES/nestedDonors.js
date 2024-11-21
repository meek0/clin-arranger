import {findSqonValueInQuery, DONORS_ANALYSIS_SERVICE_REQUEST_ID, DONORS_PATIENT_ID, DONORS_BIOINFO_ANALYSIS_CODE} from "../../utils.js"
import _ from 'lodash';

const addInnerHitsDonors = (body) => {

    // Optimise query 
    optimiseBooleanQuery(body.query)

    const newBody = structuredClone(body)
    newBody._source =  {
        "includes": [
            "*"
        ],
        "excludes": [
            "donors"
        ]
    }

    let countOfNestedDonors = 0;
    const addInnerHitsDonorsPath = (obj) => {
        for (let key in obj) {
            if (key === 'path' && obj[key] === 'donors') {
                countOfNestedDonors ++;
                return obj.inner_hits = {
                    _source: [
                      "donors.*"
                    ]
                  }
            } else if (typeof obj[key] === 'object') {
                addInnerHitsDonorsPath(obj[key]);
            }
        }
        return null;
    }
    addInnerHitsDonorsPath(newBody.query);
    // keep original body for complex nested queries
    return countOfNestedDonors === 1 ? newBody : body;
}

function optimiseBooleanQuery(query){
    if(!query.bool.must || !query.bool.must.every(subQuery => !!subQuery.bool)) return
    // Optimize clauses
    const optimizedBool = {}
    for(const subQuery of query.bool.must){
        for(const key in subQuery.bool){
            if(!optimizedBool[key]) optimizedBool[key] = []
            optimizedBool[key].push(...subQuery.bool[key])
        }
    }
    // Optimize nested
    const nesteds = []
    let index = optimizedBool.must.length
    while(index--){
        const subClause = optimizedBool.must[index]
        if(!subClause.nested) continue
        if(!nesteds.length) nesteds.push(subClause)
        else {
            if(nesteds.some(existing => _.isEqual(existing, subClause))){
                optimizedBool.must.splice(index, 1)
            } else {
                nesteds.push(subClause)
            }
        }
    }
    // Final query
    const oldQuery = {...query}
    query.bool = optimizedBool
    // console.log(`optimized query from:\n ${JSON.stringify(oldQuery)} \n to: \n ${JSON.stringify(query)}`)
}   

export default function (body) {
    const patient_id = findSqonValueInQuery(body.query, DONORS_PATIENT_ID)
    const analysis_id = findSqonValueInQuery(body.query, DONORS_ANALYSIS_SERVICE_REQUEST_ID)
    const bioinfo_analysis_code = findSqonValueInQuery(body.query, DONORS_BIOINFO_ANALYSIS_CODE)

    if(patient_id || analysis_id || bioinfo_analysis_code) {
       body = addInnerHitsDonors(body)
    }

    // console.log('[nestedDonors]', JSON.stringify(body))
    return body
}