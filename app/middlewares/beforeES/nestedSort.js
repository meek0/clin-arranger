const getPatientID = (obj) => {
    for (var key in obj) {
        if (key === 'donors.patient_id') {
            return obj[key][0];
        } else if (typeof obj[key] === 'object') {
            var result = getPatientID(obj[key]);
            if (result !== null) {
                return result;
            }
        }
    }
    return null;
}
export default function (body) {
    body.sort = body.sort.map( (sort) => {
        const field = Object.keys(sort)[0]
        if (field === 'gene') {
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
            const patient_id = getPatientID(body.query)
            const newSort = structuredClone(sort)
            newSort[field].nested.filter = {
                term: {
                    "donors.patient_id": patient_id,
                }
            }
            return newSort
        }
        return sort
    })
    return body

}