import axios from 'axios';
import jwt_decode from "jwt-decode";
import { fhirUrl } from "../config/vars.js";
import logger from "../config/logger.js";

const client = axios.create({
    baseURL: fhirUrl
});

export async function getPractitionerRoles(req) {
    try {
        const authorization = req.headers.authorization
        const decodedRpt = jwt_decode(authorization);
        const practitionerId = decodedRpt.fhir_practitioner_id;
        const response = await client.get('/PractitionerRole', {
            params: {
                practitioner: practitionerId
            },
            headers: {
                Authorization: authorization
            }
        });
        const roles = response.data?.entry?.map(entry => entry.resource?.id) || [];
        logger.info(`Fetched PractitionerRoles for: ${practitionerId} => ${roles}`);
        return roles;
    } catch (e) {
        logger.error(`Failed to fetch PractitionerRoles: ${e}`);
        return [];
    }
}

export async function getPersonsByIDs(req, ids) {
    try {
        const authorization = req.headers.authorization
        const response = await client.get(`/Person?_count=${ids.length}`, { // FHIR limit 20 by default
            params: {
                _id: ids.join(',')
            },
            headers: {
                Authorization: authorization
            }
        });
        const persons = response.data?.entry?.map(entry => entry.resource) || [];
        logger.info(`Fetched Persons IDs: ${ids} => ${persons.length}`);
        return persons;
    } catch (e) {
        logger.error(`Failed to fetch Persons: ${e}`);
        return [];
    }
}