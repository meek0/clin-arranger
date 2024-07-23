import { mapHitToUniqueId, mapVariantPropertiesToHits, getVariantsProperties } from '../../../services/variantPropertiesUtils.js';

export default async function (_, hits) {
    if (hits?.hits) {
        const uniqueIds = hits.hits.map(mapHitToUniqueId);

        try {
            const res = await getVariantsProperties(uniqueIds);
            mapVariantPropertiesToHits(hits.hits, res);
        } catch (e) {
            console.error('Failed to fetch variant flags: ', e?.message);
            return hits;
        }
    }

    return hits;
}