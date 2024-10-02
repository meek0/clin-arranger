import usersApiClient, { mapUniqueIdToHash } from '../../services/usersApiClient.js';
import {extractValuesFromSqonByField} from "../utils.js"

const MISSING = '__missing__'

function formatUniqueId (analysisIds, patientIds, index) {
    if (analysisIds && patientIds && analysisIds.length && patientIds.length) {
        // take the first none-empty id
        var analysisId = analysisIds.filter(id => id.length)[0]
        var patientId = patientIds.filter(id => id.length)[0]
        if (analysisId && patientId){
            return `${analysisId}_${patientId}_${index}`
        }
    }
    return '';
}

async function handleFlags(req, analysisIds, patientIds, index, content) {
    var flags = (content.value || []).filter(f => f !== MISSING)
    content.field = 'hash'
    content.value = []
    if (index) {
        var uniqueIds = await usersApiClient.getVariantsByFlags(req, flags, formatUniqueId(analysisIds, patientIds, index))
        var uniqueIdsByIndex = uniqueIds.filter(u => u.includes(index))
        content.value = uniqueIdsByIndex.map(mapUniqueIdToHash)
    }
}

async function handleContent(req, analysisIds, patientIds, index, content) {
    if (!content) return
    if (content.constructor === Array) {
        await Promise.all(content.map( c => handleContent(req, analysisIds, patientIds, index, c)))
    } else if (content.constructor === Object) {
        if (content.content) {
            await handleContent(req, analysisIds, patientIds, index, content.content)
        } else if (content.field === 'flags') {
            await handleFlags(req, analysisIds, patientIds, index, content)
        }
    }
}

export async function handleRequest(req) {
    const sqon = req.body?.variables?.sqon;
    const query = req.body?.query

    const patientIds = []
    const analysisIds = []

    patientIds.push(extractValuesFromSqonByField(sqon, 'donors.patient_id'))
    patientIds.push(extractValuesFromSqonByField(sqon, 'patient_id'))

    analysisIds.push(extractValuesFromSqonByField(sqon, 'donors.analysis_service_request_id'))
    analysisIds.push(extractValuesFromSqonByField(sqon, 'analysis_service_request_id'))

    const index = query?.includes('Cnv') ? 'cnv' : query?.includes('Variant') ? 'snv' : null
    await handleContent(req, analysisIds, patientIds, index, sqon?.content)
}

export default async function(req, _, next) {
    await handleRequest(req)
    next()
}