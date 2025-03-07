import usersApiClient, { mapUniqueIdToHash } from '../../services/usersApiClient.js';
import radiantApiClient from '../../services/radiantApiClient.js';
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

async function handleNote(req, analysisIds, patientIds, index, content) {
    var note = (content.value || []).indexOf(MISSING) === -1 ? 'true' : 'false';
    content.field = 'hash'
    content.value = []
    if (index) {
        var uniqueIds = await usersApiClient.getVariantsByNotePresence(req, note, formatUniqueId(analysisIds, patientIds, index))
        var uniqueIdsByIndex = uniqueIds.filter(u => u.includes(index))
        content.value = uniqueIdsByIndex.map(mapUniqueIdToHash)
    }
}

async function handleInterpretation(req, analysisIds, patientIds, index, content) {
    content.field = 'hash'
    content.value = []
    if (index) {
        let interpretations = await radiantApiClient.searchInterpretationByAnalysisIds(req, analysisIds);
        interpretations = interpretations.filter(i => patientIds.includes(i.metadata?.patient_id));
        content.value = interpretations.map(i => i.metadata?.variant_hash)
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
        } else if (content.field === 'note') {
            await handleNote(req, analysisIds, patientIds, index, content)
        } else if (content.field === 'interpretation') {
            await handleInterpretation(req, analysisIds, patientIds, index, content)
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
    await handleContent(req, analysisIds.flat(), patientIds.flat(), index, sqon?.content)
}

export default async function(req, _, next) {
    await handleRequest(req)
    next()
}