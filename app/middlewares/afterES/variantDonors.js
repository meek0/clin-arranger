export default function (_, hits) {
    if (hits?.hits) {
        hits.hits = hits.hits?.map((hit) => {
            const innerHitsDonors = hit?.inner_hits?.donors?.hits?.hits?.map((h)=> h._source)
            if (innerHitsDonors) {
                hit._source.donors = structuredClone(innerHitsDonors);
                delete hit.inner_hits;

            }
            return hit;
        });
        // console.log('[variantDonors]', hits)
    }
    return hits
}