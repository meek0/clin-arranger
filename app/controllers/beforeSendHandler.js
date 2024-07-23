import {extractValuesFromSqonByField} from "../utils.js"
import { mapVariantToUniqueId, mapVariantPropertiesToVariants, getVariantsProperties } from '../../services/variantPropertiesUtils.js';


export const cleanupDonors = (body, patientIds, analysisIds, bioinfoCodes) => {
    if (!patientIds?.length || !body?.length) {
        return body;
    }

    const data = JSON.parse(body);
    const variants = data?.data?.Variants?.hits?.edges;

    if (variants?.length) {
        // Create a set of patient_ids for faster lookup
        const patientIdsSet = new Set(patientIds.map(id => String(id)));
        const analysisIdsSet = new Set(analysisIds.map(id => String(id)));
        const bioinfoCodesSet = new Set((bioinfoCodes||[]).map(id => String(id)));

        variants.forEach(variant => {
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
        });

        return JSON.stringify(data);
    }

    return body;
};

async function fetchFlags (body) {  
    try {
        const data = JSON.parse(body);
        const variants = data?.data?.Variants?.hits?.edges;

        if (variants?.length) {
            const uniqueIds = variants.map(mapVariantToUniqueId).filter(id => !!id);
            const variantProperties  = await getVariantsProperties(uniqueIds)
            mapVariantPropertiesToVariants(variants, variantProperties);
        }
        return JSON.stringify(data);

    } catch(e) {
        console.error('Failed to fetch variant flags: ' + e?.message);
    }
    return body;
}



export default async function(req, res, next) {

    const sqon = req.body?.variables?.sqon;
    
    const patientIds = extractValuesFromSqonByField(sqon, 'donors.patient_id')
    const analysisIds = extractValuesFromSqonByField(sqon, 'donors.analysis_service_request_id')
    const bioinfoCodes = extractValuesFromSqonByField(sqon, 'donors.bioinfo_analysis_code')
    const withFlags = req.body?.query?.includes('flags');

    if (patientIds?.length > 0 || withFlags) {
        // one way to modify body is to replace the res.send() function
        const originalSend = res.send;
        res.send = async function () { // function is mandatory, () => {} doesn't work here
            if (patientIds?.length > 0) {
                arguments[0] = cleanupDonors(arguments[0], patientIds, analysisIds, bioinfoCodes)
            }
            if (withFlags) {
                arguments[0] = await fetchFlags(arguments[0])
            }
            originalSend.apply(res, arguments);
        };
    }
    return next();
}