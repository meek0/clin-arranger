import { getVariantsByFlags, mapUniqueIdToHash } from '../../services/usersApiClient.js';

export function replaceSqonFlagsWithHash(sqon, hash) {
    sqon?.content?.forEach(c => {
        if (c?.content?.field === 'flags') {
            c.content.field = 'hash'
            c.content.value = hash
        }
    });
}

export function extractFlagsAndIndexFromRequest(req) {
    const index = req.body?.query?.includes('Cnv') ? 'cnv' : req.body?.query?.includes('Variants') ? 'snv' : null
    const flags = req.body?.variables?.sqon?.content?.find(c => c.content?.field === 'flags')?.content?.value || []
    return { flags, index }
}

export default async function(req, _, next) {
    const { flags, index } = extractFlagsAndIndexFromRequest(req)
    if (flags?.length > 0) {

        if (index) {
            console.log('[flagsFilterMiddleware]', flags, index)

            var uniqueIds = await getVariantsByFlags(req, flags)
            var uniqueIdsByIndex = uniqueIds.filter(u => u.includes(index))
            var hash = uniqueIdsByIndex.map(mapUniqueIdToHash)
    
            replaceSqonFlagsWithHash(req.body.variables.sqon, hash)
        } else {
            console.warn('[flagsFilterMiddleware] Supported indexes are [Variants, Cnv]')
        }
        
    }
    next()
}