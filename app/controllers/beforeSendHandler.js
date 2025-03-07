import {extractValuesFromSqonByField} from "../utils.js"
import {stats} from "../stats.js"
import logger from '../../config/logger.js'
import { mapVariantToUniqueId, mapVariantPropertiesToVariants, getVariantsProperties } from '../../services/usersApiClient.js';
import radiantApiClient from '../../services/radiantApiClient.js';
import handleMaskPersons from './maskPersonsHandler.js'

export const cleanupDonors = (variants, patientIds, analysisIds, bioinfoCodes) => {
    const start = Date.now();
    if (patientIds?.length && variants?.length) {
        // Create a set of patient_ids for faster lookup
        const patientIdsSet = new Set(patientIds.map(id => String(id)));
        const analysisIdsSet = new Set(analysisIds.map(id => String(id)));
        const bioinfoCodesSet = new Set((bioinfoCodes||[]).map(id => String(id)));

        for(const variant of variants) {
            const donors = variant.node.donors?.hits?.edges;

            if (donors?.length) {
                const newDonors = donors.filter(d => {
                    const hasPatientId = patientIdsSet.has(String(d.node.patient_id))
                    // analysis is optional in both sqon and body response for retro-compatibility
                    const donorAnalysisId = d.node.analysis_service_request_id
                    const donorBioinfoCode = d.node.bioinfo_analysis_code
                    const hasAnalysisId = analysisIdsSet.size === 0 || !donorAnalysisId || analysisIdsSet.has(String(donorAnalysisId))
                    const hasBioinfoCode = bioinfoCodesSet.size === 0 || !donorBioinfoCode || bioinfoCodesSet.has(String(donorBioinfoCode))
                    const isValid = hasPatientId && hasAnalysisId && hasBioinfoCode
                    // console.warn('[variantDonorsHandler]', variant.hash, patientIds, analysisIds, isValid)
                    return isValid;
                });
                variant.node.donors.hits.edges = newDonors;
                variant.node.donors.hits.total = newDonors.length;
            }
        };
    }
    logger.info(`cleanupDonors patient: ${patientIds} analysis: ${analysisIds} in ${Date.now() - start} ms`);
}

async function fetchVariantProperties (req, variants, searchedFields) {
    const start = Date.now();
    try {
        if (variants?.length) {
            const uniqueIds = []
            for(const variant of variants){
                const uniqueId = mapVariantToUniqueId(variant)
                if(uniqueId) uniqueIds.push(uniqueId)
            }
            let interpretations = []
            const variantProperties = await getVariantsProperties(req, uniqueIds)
            if (searchedFields.indexOf('interpretation') > -1) {
                const analysisIds = uniqueIds.map(id => id.split('_')[1]);
                const patientIds = uniqueIds.map(id => id.split('_')[2]);
                interpretations = await radiantApiClient.searchInterpretationByAnalysisIds(req, analysisIds);
                interpretations = interpretations.filter(i => patientIds.includes(i.metadata?.patient_id));
            } 
            mapVariantPropertiesToVariants(variants, variantProperties, interpretations, searchedFields);
        }
    } catch(e) {
        logger.error('Failed to fetch variant properties: ' + e);
        if (variants?.length) {
            variants.forEach(variant => variant.node.flags = []); // ensure empty flags
        }
    } finally {
        logger.info(`fetchVariantProperties in ${Date.now() - start} ms`);
    }
}

function parseResponseBody (arg) {
    const start = Date.now();
    try{
        const data = JSON.parse(arg);
        logger.info(`parseResponseBody: ${arg.length} bytes in ${Date.now() - start} ms`);
        return data;
    } catch(e) {
        logger.error('Failed to parse response body: ' + e);
    }
}

export default async function(req, res, next) {
    const start = Date.now();
    const sqon = req.body?.variables?.sqon;

    const patientIds = extractValuesFromSqonByField(sqon, 'donors.patient_id')
    const analysisIds = extractValuesFromSqonByField(sqon, 'donors.analysis_service_request_id')
    const bioinfoCodes = extractValuesFromSqonByField(sqon, 'donors.bioinfo_analysis_code')
    const withFlags = req.body?.query?.includes('flags');
    const withNote = req.body?.query?.includes('note');
    const withPerson = req.body?.query?.includes('person');
    const withInterpretation = req.body?.query?.includes('interpretation');
    
    // one way to modify body is to replace the res.send() function
    const originalSend = res.send;
    res.send = async function () { // function is mandatory, () => {} doesn't work here
        const data = parseResponseBody(arguments[0]);
        if (patientIds?.length > 0 || withFlags || withNote || withPerson || withInterpretation) {
            // parse variants from response body
            const variants = data?.data?.Variants?.hits?.edges || data?.data?.cnv?.hits?.edges;
            cleanupDonors(variants, patientIds, analysisIds, bioinfoCodes)
            if (withFlags || withNote) {
                const searchedFields = [];
                if (withFlags) searchedFields.push('flags');
                if (withNote) searchedFields.push('note');
                if (withInterpretation) searchedFields.push('interpretation')
                await fetchVariantProperties(req, variants, searchedFields)
            }
            if (withPerson) {
                await handleMaskPersons(req, data);
            }
            // override response body with modified data
            arguments[0] = JSON.stringify(data);
        }
        originalSend.apply(res, arguments);
        logger.info(`[${req.method}] ${res.statusCode} ${req.url} body length: ${arguments[0].length} bytes in ${Date.now() - start} ms`);
        logger.info(stats());
    };
    next();
}