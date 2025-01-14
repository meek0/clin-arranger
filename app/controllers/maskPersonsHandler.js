
import logger from '../../config/logger.js'
import { getPersonsByIDs } from '../../services/fhirClient.js';

const RESTRICTED_FIELD = "*****"

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

export const removeFullyRestrictedNodes = (nodes) => {
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
        removeFullyRestrictedNodes(nodes)
    }
}

export const updateTotal = (data, indexName) => {
    const total = data?.data?.[indexName]?.hits?.edges?.length || -1
    if (total >= 0) {
        data.data[indexName].hits.total = total
    }
}

export default async function handle(req, data) {
    const nodes = data?.data?.Analyses?.hits?.edges || data?.data?.Sequencings?.hits?.edges
    const personIds = extractPersonIds(nodes)
    logger.info(`[maskPersons] Person IDs: ${personIds}`)
    const fhirPersons = await getPersonsByIDs(req, personIds)
    // both functions are separated in case we only want to mask data without removing nodes
    maskPersons(nodes, fhirPersons) // hide fields
    removeFullyRestrictedNodes(nodes) // delete from response
    updateTotal(data, 'Analyses')
    updateTotal(data, 'Sequencings')
}