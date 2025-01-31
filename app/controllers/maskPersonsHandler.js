
import logger from '../../config/logger.js'
import { getPersonsByIDs } from '../../services/fhirClient.js';

const RESTRICTED_FIELD = "*****"
const ANALYSIS_INDEX = 'Analyses'
const SEQUENCING_INDEX = 'Sequencings'

export const extractPersonIds = (nodes) => {
    const ids = [];
    const extractFromNode = (node) => {
        const personId = node?.node?.person?.id
        if (personId) {
            ids.push(personId)
        }
    }
    nodes?.forEach((node) => {
        extractFromNode(node)
        node?.node?.sequencing_requests?.hits?.edges?.forEach((sr) => {
            extractFromNode(sr)
        });
    });
    return Array.from(new Set(ids));
}

const sanitizeFhirPersons = (fhirPersons) => {
    const persons = []
    fhirPersons.forEach((person) => {
        //const name = person.name?.[0];
        persons.push({
            id: person.id,
            //first_name: name?.family,
            //last_name: name?.given?.[0],
            //ramq: person.identifier?.find(id => id.type?.coding?.find(coding => coding.code = 'JHN'))?.value
        });
    });
    return persons;
}

export const maskPersons = (nodes, fhirPersons) => {
    const persons = sanitizeFhirPersons(fhirPersons);
    const maskPerson = (node) => {
        const personId = node?.node?.person?.id
        const matchPerson = persons.find(person => person.id === personId)
        if (!matchPerson) { // user can't see that person info
            node.node.person = {
                id: RESTRICTED_FIELD,
                //first_name: RESTRICTED_FIELD,
                //last_name: RESTRICTED_FIELD,
                //ramq: RESTRICTED_FIELD
            }
        }
    }
    nodes?.forEach((node) => {
        maskPerson(node)
        node?.node?.sequencing_requests?.hits?.edges?.forEach((sr) => {
            maskPerson(sr)
        });
    });
}

export const removeFullyRestrictedNodes = (nodes, removedCount = 0) => {
    let wasUpdated = false;
    nodes?.forEach((node) => {
        const isProbandRestricted = node?.node?.person?.id === RESTRICTED_FIELD;
        const hasRestrictedFamilyMembers = node?.node?.sequencing_requests?.hits?.edges?.includes((sr) => {
            sr?.node?.node?.person?.id === RESTRICTED_FIELD
        });
        if (isProbandRestricted || hasRestrictedFamilyMembers) {
            // delete the node and stop looping because of splice
            logger.info(`[maskPersons] Removing node ${node?.node?.id}`)
            nodes.splice(nodes.indexOf(node), 1)
            wasUpdated = true;
            return;
        }
    });
    if (wasUpdated) {  // if we removed a node, we need to check again
        removedCount = removeFullyRestrictedNodes(nodes, ++removedCount)
    }
    return removedCount;
}

export const getTotalAndIndexName = (data) => {
    const totalAnalysis = data?.data?.[ANALYSIS_INDEX]?.hits?.total
    const totalSequencing = data?.data?.[SEQUENCING_INDEX]?.hits?.total
    if (totalAnalysis) {
        return { total: totalAnalysis, indexName: ANALYSIS_INDEX }
    } else if (totalSequencing) {
        return { total: totalSequencing, indexName: SEQUENCING_INDEX }
    }
    return { total: -1, indexName: null }
}

export const updateTotal = (data, indexName, newTotal) => {
    if (newTotal >= 0) {
        data.data[indexName].hits.total = newTotal
    }
}

export default async function handle(req, data) {
    const nodes = data?.data?.Analyses?.hits?.edges || data?.data?.Sequencings?.hits?.edges
    const {total, indexName} = getTotalAndIndexName(data)
    if (indexName) {
        const personIds = extractPersonIds(nodes)
        logger.info(`[maskPersons][${indexName}] Person IDs: ${personIds}`)
        const fhirPersons = await getPersonsByIDs(req, personIds)
        // both functions are separated in case we only want to mask data without removing nodes
        maskPersons(nodes, fhirPersons) // hide fields
        const removedCount = removeFullyRestrictedNodes(nodes) // delete from response
        const newTotal = total - removedCount
        updateTotal(data, indexName, newTotal)
    }
}