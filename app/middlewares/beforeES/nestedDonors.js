import {findSqonValueInQuery, DONORS_ANALYSIS_SERVICE_REQUEST_ID, DONORS_PATIENT_ID, DONORS_BIOINFO_ANALYSIS_CODE} from "../../utils.js"
import _ from 'lodash'
import logger from "../../../config/logger.js"
import { nestedDonorsOptimizationMaxIterations } from "../../../config/vars.js"

const addInnerHitsDonors = (body) => {
    try{
        const newBody = {
            ...structuredClone(body),
            _source:  {
                includes: ["*"],
                excludes: ["donors"]
            }
        }
        let nestedDonorsCount = addInnerHitsDonorsPath(newBody.query)
        let counter = 0
        while(nestedDonorsCount > 1 && counter < nestedDonorsOptimizationMaxIterations){
            newBody.query = optimizeBooleanQuery(newBody.query)
            nestedDonorsCount = addInnerHitsDonorsPath(newBody.query)
            counter++
        }

        logger.debug(`optimized query from:\n ${JSON.stringify(body.query)}\nto:\n ${JSON.stringify(newBody.query)}`)
        logger.debug(`nestedDonorsCount: ${nestedDonorsCount} in ${counter} iterations`)
        if(nestedDonorsCount > 1) logger.warn(`cannot merge nested donors for query:\n ${JSON.stringify(body.query)}`)

        // keep original body for complex nested queries
        return nestedDonorsCount === 1 ? newBody : body;
    } catch(e){
        logger.error(`optimization failed for query:\n ${JSON.stringify(body.query)}`)
        logger.error(e)
        // If optimization fails, fallbck to original query
        return body
    }
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

function isBooleanQuery(query){
    return query?.bool && Object.keys(query).length === 1
}

function isNestedTerm(term){
    return term?.nested && Object.keys(term).length === 1
}

export function optimizeBooleanQuery(query, parentOccurenceType, parentQuery) {
    // Only process boolean query
    if(!isBooleanQuery(query)) throw new Error(`invalid boolean query`)

    const optimizedQuery = { bool: {} }
    const queryClone = structuredClone(query)
    const occurrenceTypes = Object.keys(queryClone.bool)

    for(const occurrenceType of occurrenceTypes){
        // Query terms
        const terms = queryClone.bool[occurrenceType]
        const isSingleTerm = terms.length === 1
        
        if(!Array.isArray(terms)){
            optimizedQuery.bool[occurrenceType] = queryClone.bool[occurrenceType]
            continue
        }

        // Optimize nested queries
        const optimizedTerms = []
        for(const term of terms){
            let optimizedTerm = isBooleanQuery(term) ? optimizeBooleanQuery(term, occurrenceType, optimizedQuery) : term  
            if(optimizedTerm) optimizedTerms.push(optimizedTerm)
        } 

        // Check for common nested terms
        const commonMustNestedTerms = getCommonMustNestedDonors(optimizedTerms, occurrenceType, optimizedQuery)

        switch(occurrenceType){
            case "must":
                // Remove unnecessary wrapping boolean query
                if(isSingleTerm && !!parentOccurenceType) return optimizedTerms[0]
                else if(parentOccurenceType === "must" && parentQuery){
                    parentQuery.bool.must ||= []
                    parentQuery.bool.must.push(...optimizedTerms)
                    return null
                }
                mergeNestedTerms(optimizedQuery, optimizedTerms, commonMustNestedTerms, occurrenceType)
                break
            case "should":
                mergeNestedTerms(optimizedQuery, optimizedTerms, commonMustNestedTerms, occurrenceType)
                break
            case "must_not":
                if(parentOccurenceType === "must"){
                    parentQuery.bool.must_not = optimizedTerms
                    return null
                }
                optimizedQuery.bool.must_not = optimizedTerms
                break;
            default:
                optimizedQuery.bool[occurrenceType] = optimizedTerms
        }
    }
    return optimizedQuery
}

function mergeNestedTerms(optimizedQuery, optimizedTerms, commonMustNestedTerms, occurrenceType){
    if(commonMustNestedTerms?.length){
 
        const optimizedQueryBool = { bool: {} }
        const optimizedNestedQuery = []
        const otherTerms = []

        function cleanNestedTerm(term){
            // If it's a query iterate over terms
            if(isBooleanQuery(term)){
                Object.values(term.bool).forEach( terms => terms.forEach(cleanNestedTerm))
                return
            }

            // If it's not a nested donor term add to other terms to keep it in the query
            if(!isNestedTerm(term) || term.nested.path !== "donors"){
                otherTerms.push(term)
                return
            }

            // Iterate over nested terms and remove common nested terms
            if(term.nested.query.bool.must){
                term.nested.query.bool.must = term.nested.query.bool.must.filter( nestedTerm => !commonMustNestedTerms.some( cnd => _.isEqual(cnd, nestedTerm) ) )
                if(!term.nested.query.bool.must.length) delete term.nested.query.bool.must
            }
            if(!Object.keys(term.nested.query.bool).length) return
            const optimizedQuery = optimizeBooleanQuery(term.nested.query, occurrenceType)
            if(!optimizedQuery.bool || Object.keys(optimizedQuery.bool).length) optimizedNestedQuery.push(optimizedQuery)
        }


        optimizedTerms.forEach(cleanNestedTerm)

        switch(occurrenceType){
            case "must":
                optimizedQueryBool.bool.must = [
                    ...commonMustNestedTerms,
                    ...optimizedNestedQuery
                ]
                break
            case "should":
                optimizedQueryBool.bool.must = commonMustNestedTerms
                optimizedQueryBool.bool.should = optimizedNestedQuery
                if(optimizedNestedQuery.length > 1) optimizedQueryBool.bool.minimum_should_match = 1
                break
        }

        optimizedQuery.bool.must ||= []
        optimizedQuery.bool.must.push({
            nested: {
                path: "donors",
                query: optimizedQueryBool
            }
        })
        optimizedQuery.bool.must.push(...otherTerms)
    } else {
        optimizedQuery.bool[occurrenceType] ||= []
        optimizedQuery.bool[occurrenceType].push(...optimizedTerms)
    }
}

function getCommonMustNestedDonors(terms, occurrenceType){
    if(!terms?.length > 1) return []

    let nestedPath, commonMustNested

    // Deal with nested queries
    if(terms.every(term => isBooleanQuery(term))){
        for(const query of terms){
            // Only process must terms
            if(!query.bool.must) continue
            const nestedQueryCommonMustNested = getCommonMustNestedDonors(query.bool.must, "must")
            if(nestedQueryCommonMustNested?.length){
                if(!commonMustNested) commonMustNested = [...nestedQueryCommonMustNested]
                else if(nestedQueryCommonMustNested.some( term => !commonMustNested.find( cmt => _.isEqual(cmt, term) ) )) return []
            }
        }
        if(commonMustNested) return commonMustNested
    }
    
    // Deal with nested terms
    for(const nestedTerm of terms){
        if(!isNestedTerm(nestedTerm)) {
            if(occurrenceType === "should") return []
            continue
        }
        if(nestedTerm.nested.path !== "donors") continue

        if(nestedPath === undefined) nestedPath = nestedTerm.nested.path
        else if(nestedPath && nestedPath !== nestedTerm.nested.path) nestedPath = null

        if(nestedPath === null) return []

        if(commonMustNested === undefined) commonMustNested = [...nestedTerm.nested.query.bool.must]
        let index = commonMustNested.length
        while(index--){
            if(!nestedTerm.nested.query.bool.must.find( term => _.isEqual(term, commonMustNested[index]) )){
                commonMustNested.splice(index, 1)
            }
        }
    }

    return commonMustNested
}

export default function (body) {
    try{
        const patient_id = findSqonValueInQuery(body.query, DONORS_PATIENT_ID)
        const analysis_id = findSqonValueInQuery(body.query, DONORS_ANALYSIS_SERVICE_REQUEST_ID)
        const bioinfo_analysis_code = findSqonValueInQuery(body.query, DONORS_BIOINFO_ANALYSIS_CODE)

        if(patient_id || analysis_id || bioinfo_analysis_code) body = addInnerHitsDonors(body)
            
        return body
    } catch(e) {
        logger.error(e)
        throw e
    }
}