import {findSqonValueInQuery, DONORS_ANALYSIS_SERVICE_REQUEST_ID, DONORS_PATIENT_ID, DONORS_BIOINFO_ANALYSIS_CODE} from "../../utils.js"
import _ from 'lodash';

const addInnerHitsDonors = (body) => {
    const newBody = {
        ...structuredClone(body),
        _source:  {
            includes: ["*"],
            excludes: ["donors"]
        }
    }

    // Optimise query 
    optimiseBooleanQuery(newBody.query)

    // keep original body for complex nested queries
    let nestedDonorsCount = addInnerHitsDonorsPath(newBody.query)

    let maxIterations = 1
    while(nestedDonorsCount > 1 && maxIterations--){
        optimiseBooleanQuery(newBody.query)
        nestedDonorsCount = addInnerHitsDonorsPath(newBody.query)
    }

    console.log(`nestedDonorsCount: ${nestedDonorsCount}`)
    return nestedDonorsCount === 1 ? newBody : body;
}

export function addInnerHitsDonorsPath(obj, hasNestedDonorsInit = 0){
    let hasNestedDonors = hasNestedDonorsInit
    for(const key in obj) {
        if (key === 'path' && obj[key] === 'donors') {
            hasNestedDonors++
            if(!obj.inner_hits) obj.inner_hits = { _source: ["donors.*"] }
        } else if (typeof obj[key] === 'object') {
            hasNestedDonors = addInnerHitsDonorsPath(obj[key], hasNestedDonors)
        }
    }
    return hasNestedDonors
}

export function optimiseBooleanQuery(query){
    const oldQuery = structuredClone(query)
    const optimizedBool = {
        must: [],
        should: [],
        must_not: []
    }
    let commonNestedDonors
    for(const occurrenceType in query.bool){
        const terms = query.bool[occurrenceType]
        switch(occurrenceType){
            case "must":
                for(const term of terms){
                    if(term.bool?.must) {
                        for(const nestedDonorsMustTerm of term.bool.must){
                            if(nestedDonorsMustTerm.nested?.path !== "donors") continue
                            commonNestedDonors = getCommonMustNestedDonors(nestedDonorsMustTerm.nested.query.bool.must, commonNestedDonors)
                        }
                        optimizedBool.must.push(...term.bool.must)
                    } else if(term.bool?.should) {
                        // Remove wraping 'must query' if only one term
                        const shouldNested = { bool: { should: [] } }
                        for(const subTerm of term.bool.should){
                            if(subTerm.bool?.must?.length === 1) shouldNested.bool.should.push(...subTerm.bool.must)
                            else shouldNested.bool.should.push(subTerm)
                        }

                        // Merge should terms if all are nested donors
                        const optimizedShouldNested = joinShouldNestedDonorsQueries(shouldNested) || shouldNested
                        // Get common nested donors
                        if(optimizedShouldNested.nested){
                            commonNestedDonors = getCommonMustNestedDonors(optimizedShouldNested?.nested.query.bool.must, commonNestedDonors)
                        }

                        optimizedBool.must.push(optimizedShouldNested ? optimizedShouldNested : shouldNested)
                    } else if(term.bool?.must_not){
                        optimizedBool.must_not.push(...term.bool.must_not)
                    } else {
                        optimizedBool.must.push(term)
                    }
                }

                // If common nested
                if(commonNestedDonors?.length){  
                    const finalDonorNested = {
                        nested: {
                            path: "donors",
                            query: {
                                bool: {
                                    must: commonNestedDonors
                                }
                            }
                        }
                    }
                    let index = optimizedBool.must.length
                    while(index--){
                        const existingNestedMust = optimizedBool.must[index]
                        if(!existingNestedMust.nested) continue
                        const optimizedNestedDonor = {
                            bool: {
                                must: existingNestedMust.nested.query.bool.must.filter(term => !commonNestedDonors.some( cnd => _.isEqual(cnd, term) )),
                                should: existingNestedMust.nested.query.bool.should,
                                must_not: existingNestedMust.nested.query.bool.must_not
                            }
                        }
                        for(const operator of ["must", "should", "must_not"]){
                            if(!optimizedNestedDonor.bool[operator]?.length) delete optimizedNestedDonor.bool[operator]
                        }
                        
                        finalDonorNested.nested.query.bool.must.push(optimizedNestedDonor)
                        optimizedBool.must.splice(index, 1)
                    }
                    optimizedBool.must.push(finalDonorNested)
                }

                break;
            case "should":
            default: 
                optimizedBool[occurrenceType] = query.bool[occurrenceType]
        }
    }

    // Optimize nested
    for(const operator of ["must", "should", "must_not"]){
        if(!optimizedBool[operator]?.length) delete optimizedBool[operator]
    }

    // Final query
    query.bool = optimizedBool
    if(JSON.stringify(oldQuery).length > 4000) console.log(`optimized query from:\n ${JSON.stringify(oldQuery)} \n to: \n ${JSON.stringify(query)}`)
}

function getCommonMustNestedDonors(donorsMustTerms, commonMustNestedDefault){
    if(!donorsMustTerms) return
    if(!commonMustNestedDefault) return donorsMustTerms

    const commonMustNested = commonMustNestedDefault
    let index = commonMustNested.length
    while(index--){
        if(!donorsMustTerms.find( term => _.isEqual(term, commonMustNested[index]) )){
            commonMustNested.splice(index, 1)
        }
    }

    return commonMustNested
}

function joinShouldNestedDonorsQueries(term){
    if(!term.bool.should || Object.keys(term.bool).length !== 1) return
    let otherTerms = []
    const nestedShouldDonorTerms = []
    term.bool.should.forEach(term => {
        if(term.nested?.path === "donors") nestedShouldDonorTerms.push(term)
        else otherTerms.push(term)
    })
    if(!nestedShouldDonorTerms.length) return

    const shouldTerms = []
    let initialized = false
    const commonMustTerms = []
    for(const shouldTerm of nestedShouldDonorTerms){
        if(shouldTerm.nested.query.bool?.must){
            if(!initialized){
                commonMustTerms.push(...shouldTerm.nested.query.bool.must)
                initialized = true
            } else {
                let index = commonMustTerms.length
                while(index--){
                    if(!shouldTerm.nested.query.bool.must.find( term => _.isEqual(term, commonMustTerms[index]) )){
                        commonMustTerms.splice(index, 1)
                    }
                }
            }
        }
        shouldTerms.push(shouldTerm.nested.query)
    }

    // Factorize common must terms
    if(commonMustTerms.length){
        for(const shouldTerm of shouldTerms){
            let index = shouldTerm.bool.must.length
            while(index--){
                if(commonMustTerms.some(term => _.isEqual(term, shouldTerm.bool.must[index]))){
                    shouldTerm.bool.must.splice(index, 1)
                    if(!shouldTerm.bool.must.length) delete shouldTerm.bool.must
                }
            }
        }
    }

    const optimizedDonor = {
        nested: {
            path: "donors",
            query: {
                bool: {
                    should: shouldTerms,
                    must: commonMustTerms
                }
            }
        }
    }

    if(otherTerms.length) otherTerms.forEach(optimiseBooleanQuery)

    if(otherTerms.length === 1 && otherTerms[0].bool?.must?.length === 1) otherTerms = otherTerms[0].bool.must

    return otherTerms.length ? {
        bool: {
            should: [
                optimizedDonor,
                ...otherTerms
            ]
        }
    } : optimizedDonor
}

export default function (body) {
    try{
        const patient_id = findSqonValueInQuery(body.query, DONORS_PATIENT_ID)
        const analysis_id = findSqonValueInQuery(body.query, DONORS_ANALYSIS_SERVICE_REQUEST_ID)
        const bioinfo_analysis_code = findSqonValueInQuery(body.query, DONORS_BIOINFO_ANALYSIS_CODE)

        if(patient_id || analysis_id || bioinfo_analysis_code) body = addInnerHitsDonors(body)
            
        return body
    } catch(e) {
        console.error(e)
    }
}