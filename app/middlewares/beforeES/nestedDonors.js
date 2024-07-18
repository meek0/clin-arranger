import {findSqonValueInQuery, DONORS_ANALYSIS_SERVICE_REQUEST_ID, DONORS_PATIENT_ID, DONORS_BIOINFO_ANALYSIS_CODE} from "../../utils.js"

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

    let countOfNestedDonors = 0;

    const addInnerHitsDonorsPath = (obj) => {
        for (var key in obj) {
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