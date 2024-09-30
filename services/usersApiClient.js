import axios from 'axios';

import { usersApiUrl } from "../config/vars.js";

const PROPERTIES_NOT_FOUND = { properties: { flags: [] } };

const usersApiClient = axios.create({
    baseURL: usersApiUrl
});

export function mapVariantToUniqueId(variant) {
    const node = variant?.node;
    if (node && (node.donors?.hits?.edges?.length > 0 || node.analysis_service_request_id)) {
        let quickId = '';
        const donorsNode = node.donors?.hits?.edges?.[0].node;
        if (donorsNode) {
            quickId = `${node.hash}_${donorsNode.analysis_service_request_id}_${donorsNode.patient_id}`;
        } else if (node.analysis_service_request_id) {
            quickId = `${node.hash}_${node.analysis_service_request_id}_${node.patient_id}`;
        } else {
            return null;
        }

        if (node.patient_id && node.hash) { // CNV
            return `${quickId}_cnv`;
        } else if (node.locus) {    // SNV
            return `${quickId}_snv`;
        } else {
            return null;    // avoid undefined_cnv/snv
        }
    } else {
        return null;
    }
}

export function mapUniqueIdToHash(uniqueId) {
    return uniqueId.split('_')[0];
}

export function mapVariantPropertiesToVariants(variants, variantProperties) {
    const usableVariantProperties = Array.isArray(variantProperties) ? variantProperties : [];
    if (Array.isArray(variants)) {
        variants.forEach(variant => {
            const uniqueId = mapVariantToUniqueId(variant);
            const foundProperties = usableVariantProperties.filter(props => uniqueId === props?.unique_id);
            foundProperties.forEach(props => props.timestamp = new Date(props.timestamp));
            foundProperties.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            const lastFoundProperties = foundProperties[0] || PROPERTIES_NOT_FOUND;
            variant.node.flags = [...lastFoundProperties.properties.flags];
            // console.log('variant.node.flags', variant.node.flags);
        });
    }
    return variants;
}

export async function getVariantsProperties(req, ids) {
    if (Array.isArray(ids) && ids.length > 0) {
        const response = await usersApiClient.get('/variants', {
            params: {
                unique_id: ids
            },
            headers: {
                Authorization: req.headers.authorization
            }
        });
        return response.data;
    } else {
        return [];
    }
}

export async function getVariantsByFlags(req, flags) {
    if (Array.isArray(flags) && flags.length > 0) {
        const response = await usersApiClient.get('/variants/filter', {
            params: {
                flag: flags,
                timestamp: new Date().toISOString()
            },
            headers: {
                Authorization: req.headers.authorization
            }
        });
        return response.data;
    } else {
        return [];
    }
}

export default usersApiClient;
