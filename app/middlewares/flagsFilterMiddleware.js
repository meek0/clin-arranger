import usersApiClient, { mapUniqueIdToHash } from '../../services/usersApiClient.js';

const MISSING = '__missing__'

async function handleFlags(req, index, content) {
    console.log(`-> handleFlags: index = ${index}, content = ${JSON.stringify(content)}`)
    var flags = content.value || []
    content.field = 'hash'
    content.value = []
    if (index) {
        var uniqueIds = await usersApiClient.getVariantsByFlags(req, flags.filter(f => f !== MISSING))
        var uniqueIdsByIndex = uniqueIds.filter(u => u.includes(index))
        content.value = uniqueIdsByIndex.map(mapUniqueIdToHash)
        console.log(`content.value = ${JSON.stringify(content.value)}`)
    }
    if (flags.includes(MISSING)) {
        content.value.push(MISSING)
    }
}

async function handleContent(req, index, content) {
    console.log("-> handleContent: index = ${index}, content = ${JSON.stringify(content)}")
    if (!content) return
    if (content.constructor === Array) {
        await Promise.all(content.map( c => handleContent(req, index, c)))
    } else if (content.constructor === Object) {
        if (content.content) {
            await handleContent(req, index, content.content)
        } else if (content.field === 'flags') {
            await handleFlags(req, index, content)
        }
    }
}

export async function handleRequest(req) {
    console.log("-> handleRequest ")
    const index = req.body?.query?.includes('Cnv') ? 'cnv' 
    : req.body?.query?.includes('Variant') ? 'snv' : null
    await handleContent(req, index, req.body?.variables?.sqon?.content)
}

export default async function(req, _, next) {
    await handleRequest(req)
    next()
}