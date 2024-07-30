import axios from 'axios';

import { usersApiUrl } from "../config/vars.js";

const PROPERTIES_NOT_FOUND = { properties: { flags: [] } };

const usersApiClient = axios.create({
    baseURL: usersApiUrl
});

export function mapVariantToUniqueId(variant) {
    const node = variant?.node;
    if (node) {
        if (node.patient_id && node.hash) { // CNV
            return `${node.hash}_cnv`;
        } else if (node.locus) {    // SNV
            return `${node.locus}_snv`;
        } else {
            return null;    // avoid undefined_cnv/snv
        }
    } else {
        return null;
    }
}

export function mapVariantPropertiesToVariants(variants, variantProperties) {
    const usableVariantProperties = Array.isArray(variantProperties) ? variantProperties : [];
    if (Array.isArray(variants)) {
        variants.forEach(variant => {
            const uniqueId = mapVariantToUniqueId(variant);
            const foundProperties = usableVariantProperties.filter(props => uniqueId === props?.unique_id);
            foundProperties.forEach(props => props.timestamp = new Date(props.timestamp));
            foundProperties.sort((a, b) => b.timestamp - a.timestamp);
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

export default usersApiClient;
