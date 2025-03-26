import EsInstance from "../../services/esClient.js";
import radiantApiClient from '../../services/radiantApiClient.js';
import { indexNameVariants } from "../../config/vars.js";
import {
  makeSingleVariantReport,
  makeColumnsAndRows,
  getWorksheetName,
  makeReport,
  getHeaderRowHeightPx,
} from "../reports/patientTranscription.js";
import { sendBadRequest, sendNotFound } from "../httpUtils.js";
import {
  makeFilenameDatePart,
  setSpreadSheetHeaders,
} from "../reports/reportUtils.js";

// Just a rough validation - the param should only be used by ES.
const illegalCharacters = [..."[!@#$%^&=[{|;'”|,/?]+"];
const validateVariantInput = (vId) =>
  vId &&
  typeof vId === "string" &&
  vId.length > 0 &&
  [...vId].every((c) => !illegalCharacters.includes(c));


// !Assumes req passed through patientSecurityHandler!
export async function singleVariantReport(req, res) {
  const variantId = req.params.variantId;
  const inputIsInvalid = !validateVariantInput(variantId);
  if (inputIsInvalid) {
    return sendBadRequest(res);
  }

  const patientId = req.params.patientId;

  const client = EsInstance.getInstance();

  const response = await client.search({
    index: indexNameVariants,
    body: {
      query: {
        bool: {
          must: [
            {
              terms: {
                hgvsg: [variantId],
              },
            },
            {
              nested: {
                path: "donors",
                query: {
                  bool: {
                    must: [
                      {
                        terms: {
                          "donors.patient_id": [patientId],
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    },
  });

  const data = response?.body?.hits?.hits?.[0]?._source || [];
  const donor = data.donors?.find((d) => d.patient_id === patientId) || {};
  const transcriptId = data.consequences?.find(({ picked }) => !!picked)?.ensembl_transcript_id;
  const interpretation = await radiantApiClient.fetchInterpretation(
    req,
    donor.variant_type,
    donor.service_request_id,
    data.locus,
    transcriptId
  );
  const workbook = makeSingleVariantReport({ ...data, donor, interpretation });
  const fileName = `${[
    patientId,
    donor.service_request_id,
    data.rsnumber,
    makeFilenameDatePart(new Date()),
  ]
    .filter((e) => !!e)
    .join("_")}.xlsx`;
  const enhancedRes = setSpreadSheetHeaders(res, fileName);
  await workbook.xlsx.write(enhancedRes);
  enhancedRes.end();
  workbook.eachSheet((sheetId) => {
    workbook.removeWorksheet(sheetId);
  });
};

// !Assumes req passed through patientSecurityHandler!
export async function multiVariantReport(req, res, next) {
  try {
    const patientId = req.params.patientId;

    if (!req.body || !req.body?.variantIds?.length)
      return sendBadRequest(res);

    for (const variantId of req.body.variantIds) {
      const inputIsInvalid = !validateVariantInput(variantId);
      if (inputIsInvalid) {
        return sendBadRequest(res);
      }
    }

    const client = EsInstance.getInstance();

    const matchPhrases = req.body.variantIds.map(variantId => ({
      match_phrase: {
        hgvsg: variantId
      }
    }));

    const response = await client.search({
      index: indexNameVariants,
      body: {
        query: {
          bool: {
            must: [
              {
                bool: {
                  should: matchPhrases,
                  minimum_should_match: 1,
                },
              },
              {
                nested: {
                  path: "donors",
                  query: {
                    bool: {
                      must: [
                        {
                          terms: {
                            "donors.patient_id": [patientId],
                          },
                        },
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      },
    });

    if (!response?.body?.hits?.hits.length || response.body.hits.hits.length == 0)
      return sendNotFound(res);

    const workSheetNames = [];
    const workSheetsColumns = [];
    const workSheetsRows = [];

    for (const hits of response?.body?.hits?.hits) {
      const data = hits._source || [];
      const donor = data.donors?.find((d) => d.patient_id === patientId) || {};
      const transcriptId = data.consequences?.find(({ picked }) => !!picked)?.ensembl_transcript_id;
      const interpretation = await radiantApiClient.fetchInterpretation(
        req,
        donor.variant_type,
        donor.service_request_id,
        data.locus,
        transcriptId
      );
      const workSheetName = getWorksheetName(data);
      workSheetNames.push(workSheetName)
      const { sheetColumns, sheetRows } = makeColumnsAndRows({ ...data, donor, interpretation }, workSheetName);
      workSheetsColumns.push(...sheetColumns);
      workSheetsRows.push(...sheetRows);
    }
    const headerRowHeightPx = getHeaderRowHeightPx(response?.body?.hits?.hits?.[0]?._source);
    const workbook = makeReport(workSheetNames, workSheetsColumns, workSheetsRows, headerRowHeightPx);
    const fileName = `${[
      patientId,
      response?.body?.hits?.hits?.[0]?._source?.donors?.find((d) => d.patient_id === patientId)?.service_request_id || "",
      makeFilenameDatePart(new Date()),
    ]
      .filter((e) => !!e)
      .join("_")}.xlsx`;
    const enhancedRes = setSpreadSheetHeaders(res, fileName);
    await workbook.xlsx.write(enhancedRes);
    enhancedRes.end();
    workbook.eachSheet((sheetId) => {
      workbook.removeWorksheet(sheetId);
    });
  } catch (e) {
    next(e)
  }
}