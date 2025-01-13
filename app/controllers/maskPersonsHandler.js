
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
        const name = person.name?.[0];
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
                first_name: RESTRICTED_FIELD,
                last_name: RESTRICTED_FIELD,
                ramq: RESTRICTED_FIELD
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

export default async function handle(req, data) {
    const nodes = data?.data?.Analyses?.hits?.edges || data?.data?.Sequencings?.hits?.edges
    const personIds = extractPersonIds(nodes)
    logger.info(`[maskPersons] Person IDs: ${personIds}`)
    const fhirPersons = await getPersonsByIDs(req, personIds)
    maskPersons(nodes, fhirPersons)
}