import Report from "./index.js";

/**
 * @param {{ patientInfo: Object, mrn: string, cid: string }[]} data - service requests
 */
const makeRows = (data) =>
  data.map((sr, index) => ({
    index,
    coordinates: "",
    volume: "",
    ldmSampleId: "",
    ldmSpecimenId: "",
    firstName: sr.patientInfo?.firstName,
    lastName: sr.patientInfo?.lastName,
    gender: sr.patientInfo?.gender,
    birthDate: sr.patientInfo?.birthDate,
    institution: sr.patientInfo?.organization?.cid,
    mrn: sr.mrn,
    cId: sr.cid,
    ramq: sr.patientInfo?.ramq,
    specimenTissueSource: "NBL",
    sampleType: "DNA",
    specimenType: "NORMAL",
  }));

const COL_REGULAR_WIDTH = 30;

export const makeReport = (data) => {
  const columns = [
    { header: "puit", key: "coordinates" },
    { header: "volume", key: "volume" },
    { header: "ID_echantillon_LDM", key: "ldmSampleId" },
    { header: "ID_specimen_LDM", key: "ldmSpecimenId" },
    { header: "prenom_patient", key: "firstName" },
    {
      header: `nom_patient`,
      key: "lastName",
    },
    { header: "sexe", key: "gender" },
    { header: "DDN", key: "birthDate" },
    { header: "institution", key: "institution" },
    { header: "dossier_medical", key: "mrn" },
    { header: "service_request_id", key: "cId" },
    { header: "RAMQ", key: "ramq" },

    { header: "tissue_source", key: "specimenTissueSource" },
    { header: "type_echantillon", key: "sampleType" },
    { header: "type_specimen", key: "specimenType" },
  ].map((col) => ({ ...col, width: COL_REGULAR_WIDTH }));

  const rows = makeRows(data);

  return new Report(columns, rows).build();
};
