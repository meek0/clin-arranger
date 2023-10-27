// extract the inner_hits from ES response if available and copy its content where is should be normally:
// - inner_hits.donors (is from beforeES/nestedDonors)
// - (add more inner_hits bellow ...)
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