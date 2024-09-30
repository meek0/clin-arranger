import { getVariantsByFlags, mapUniqueIdToHash } from '../../services/usersApiClient.js';

async function handleFlags(req, index, content, fetchFunction) {
    var flags = content.value || []
    var uniqueIds = await fetchFunction(req, flags)
    var uniqueIdsByIndex = uniqueIds.filter(u => u.includes(index))
    content.field = 'hash'
    content.value = uniqueIdsByIndex.map(mapUniqueIdToHash)
}

function handleContent(req, index, content, fetchFunction) {
    if (content.constructor === Array) {
        content.map(c => handleContent(req, index, c, fetchFunction))
    } else if (content.constructor === Object) {
        if (content.content) {
            handleContent(req, index, content.content, fetchFunction)
        } else if (content.field === 'flags') {
            handleFlags(req, index, content, fetchFunction)
        }
    }
}

export function handleRequest(req, fetchFunction) {
    const index = req.body?.query?.includes('Cnv') ? 'cnv' : req.body?.query?.includes('Variants') ? 'snv' : null
    if (index) {
        handleContent(req, index, req.body.variables.sqon.content, fetchFunction)
    } else {
        console.warn('[flagsFilterMiddleware] Supported indexes are [Variants, Cnv]')
    }
}

export default function(req, _, next) {
    handleRequest(req, getVariantsByFlags)
    next()
}