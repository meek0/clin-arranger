import {findSqonValueInQuery, DONORS_ANALYSIS_SERVICE_REQUEST_ID, DONORS_PATIENT_ID, DONORS_BIOINFO_ANALYSIS_CODE} from "../../utils.js"
import _ from 'lodash'
import logger from "../../../config/logger.js"

export default function (body) {
    try{
        const patient_id = findSqonValueInQuery(body.query, DONORS_PATIENT_ID)
        const analysis_id = findSqonValueInQuery(body.query, DONORS_ANALYSIS_SERVICE_REQUEST_ID)
        const bioinfo_analysis_code = findSqonValueInQuery(body.query, DONORS_BIOINFO_ANALYSIS_CODE)

        if(patient_id || analysis_id || bioinfo_analysis_code) {
            body = {
                ...structuredClone(body),
                _source:  {
                    includes: ["hash"],
                    excludes: ["*"]
                }
            }
            logger.debug(`[nestedDonors] Split donors query: ${JSON.stringify(body)}`)
        }
        return body
    } catch(e) {
        logger.error(e)
        throw e
    }
}