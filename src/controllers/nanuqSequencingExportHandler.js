import EsInstance from "../services/esClient.js";
import { indexNamePrescriptions } from "../config/vars.js";
import {
  extractSecurityTags,
  haveNonEmptyTagsIntersection,
} from "../permissionsUtils.js";
import jwt_decode from "jwt-decode";
import { compose } from "../utils.js";
import { makeReport } from "../reports/nanuqSequencing.js";
import {
  makeFilenameDatePart,
  setSpreadSheetHeaders,
} from "../reports/reportUtils.js";
import { sendBadRequest } from "../httpUtils.js";

/**
 * @param {{ securityTags: string[], patientInfo: { securityTags: string[] } }[]} srs - service requests
 * @param {string[]} userSecurityTags - user security tags from token
 */
const keepAllowedSRs = (srs, userSecurityTags) =>
  srs.filter(
    (sr) =>
      haveNonEmptyTagsIntersection(userSecurityTags, sr.securityTags) &&
      haveNonEmptyTagsIntersection(
        userSecurityTags,
        sr.patientInfo.securityTags
      )
  );

export default async (req, res) => {
  const selectedSrIds = req.query.srIds;
  if (!selectedSrIds?.length) {
    return sendBadRequest(res);
  }

  const client = EsInstance.getInstance();

  const response = await client.search({
    index: indexNamePrescriptions,
    body: {
      query: {
        terms: {
          cid: selectedSrIds,
        },
      },
    },
  });

  const userSecurityTags = compose(
    extractSecurityTags,
    jwt_decode
  )(req.headers.authorization);

  const srs =
    response?.body?.hits?.hits?.map((hit) => ({ ...hit._source })) || [];

  const srsFiltered = keepAllowedSRs(srs, userSecurityTags);

  const [workbook, sheet] = makeReport(srsFiltered);

  const fileName = `clin_nanuq_${makeFilenameDatePart(new Date())}.xlsx`;

  const enhancedRes = setSpreadSheetHeaders(res, fileName);

  await workbook.xlsx.write(enhancedRes);

  enhancedRes.end();

  workbook.removeWorksheetEx(sheet);
};
