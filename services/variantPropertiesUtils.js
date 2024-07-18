import axios from 'axios';

import { usersApiUrl } from "../config/vars.js";

const PROPERTIES_NOT_FOUND = { properties: { flags: [] } };

const usersApiClient = axios.create({
    baseURL: usersApiUrl
});

export function mapHitToUniqueId(hit) {
    return hit._source.variant_class === 'SNV' ? `${hit._source.locus}_snv` : `${hit._source.hash}_cnv`;
}

export function mapVariantPropertiesToHits(hits, variantProperties) {
    if (Array.isArray(hits) && Array.isArray(variantProperties)) {
        hits.forEach(hit => {
            const uniqueId = mapHitToUniqueId(hit);
            const foundProperties = variantProperties.filter(props => props.unique_id === uniqueId);
            foundProperties.forEach(props => props.timestamp = new Date(props.timestamp));
            foundProperties.sort((a, b) => b.timestamp - a.timestamp);
            const lastFoundProperties = foundProperties[0] || PROPERTIES_NOT_FOUND;
            hit._source.flags = lastFoundProperties.properties.flags;
        });
    }

    return hits;
}

export async function getVariantsProperties(ids) {
    if (Array.isArray(ids) && ids.length > 0) {
        const response = await usersApiClient.get('/variants', {
            params: {
                unique_id: ids
            }
        });

        return response.data;
    } else {
        return [];
    }
}

export default usersApiClient;
