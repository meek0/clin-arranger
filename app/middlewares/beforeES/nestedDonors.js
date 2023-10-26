import {findSqonValueInQuery, DONORS_ANALYSIS_SERVICE_REQUEST_ID, DONORS_PATIENT_ID} from "../../utils.js"

const addInnerHitsDonors = (body) => {
    const newBody = structuredClone(body)
    newBody._source =  {
        "includes": [
            "*"
        ],
        "excludes": [
            "donors"
        ]
    }
    
    const addInnerHitsDonorsPath = (obj) => {
        for (var key in obj) {
            if (key === 'path' && obj[key] === 'donors') {
                return obj.inner_hits = {
                    _source: [
                      "donors.*"
                    ]
                  }
            } else if (typeof obj[key] === 'object') {
                var result = addInnerHitsDonorsPath(obj[key]);
                if (result !== null) {
                    return result;
                }
            }
        }
        return null;
    }
    addInnerHitsDonorsPath(newBody);
    return newBody;
}

export default function (body) {
    const patient_id = findSqonValueInQuery(body.query, DONORS_PATIENT_ID)
    const analysis_id = findSqonValueInQuery(body.query, DONORS_ANALYSIS_SERVICE_REQUEST_ID)

    if(patient_id || analysis_id) {
        body = addInnerHitsDonors(body)
    }

    // console.log('[nestedDonors]', JSON.stringify(body))
    return body
}