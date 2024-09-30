import { getVariantsByFlags, mapUniqueIdToHash } from '../../services/usersApiClient.js';

const MISSING = '__missing__'

async function handleFlags(req, index, content, fetchFunction) {
    var flags = content.value || []
    content.field = 'hash'
    content.value = []
    if (index) {
        var uniqueIds = await fetchFunction(req, flags)
        var uniqueIdsByIndex = uniqueIds.filter(u => u.includes(index))
        content.value = uniqueIdsByIndex.map(mapUniqueIdToHash)
    }
    if (flags.includes(MISSING)) {
        content.value.push(MISSING)
    }
    
}

async function handleContent(req, index, content, fetchFunction) {
    if (!content) return
    if (content.constructor === Array) {
        content.map(c => handleContent(req, index, c, fetchFunction))
    } else if (content.constructor === Object) {
        if (content.content) {
            await handleContent(req, index, content.content, fetchFunction)
        } else if (content.field === 'flags') {
            await handleFlags(req, index, content, fetchFunction)
        }
    }
}

export async function handleRequest(req, fetchFunction) {
    const index = req.body?.query?.includes('Cnv') ? 'cnv' 
    : req.body?.query?.includes('Variant') ? 'snv' : null
    await handleContent(req, index, req.body?.variables?.sqon?.content, fetchFunction)
}

export default function(req, _, next) {
    handleRequest(req, getVariantsByFlags).then(() => next())
}