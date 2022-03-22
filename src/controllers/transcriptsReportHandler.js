import EsInstance from "../services/esClient.js";
import { indexNameVariants } from "../config/vars.js";
import { makeReport } from "../reports/patientTranscription.js";
import { sendBadRequest } from "../httpUtils.js";

const joinWithPadding = (l) =>
  l.reduce((xs, x) => xs + `${x}`.padStart(2, '0'), '');

const filenameDateSuffix = (date) => {
  const prefixes = joinWithPadding([
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
  ]);
  const suffixes = joinWithPadding([
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  ]);
  return `${prefixes}T${suffixes}Z`;
};

const extractData = (hits) => hits?.hits?.[0]?._source || {};

// Just a rough validation - the param should only be used by ES.
const illegalCharacters = [..."[!@#$%^&=[{|;'”|,/?]+"];
const validateVariantInput = (vId) =>
  vId &&
  typeof vId === "string" &&
  vId.length > 0 &&
  [...vId].every((c) => !illegalCharacters.includes(c));

// !Assumes req passed through patientSecurityHandler!
export default async (req, res) => {
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

  const data = extractData(response?.body?.hits);
  const donor = data.donors?.find((d) => d.patient_id === patientId) || {};

  const [workbook, sheet] = makeReport({ ...data, donor });

  const fileName = `${[
    patientId,
    donor.service_request_id,
    data.rsnumber,
    filenameDateSuffix(new Date()),
  ]
    .filter((e) => !!e)
    .join("_")}.xlsx`;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

  await workbook.xlsx.write(res);

  res.end();

  workbook.removeWorksheetEx(sheet);
};
