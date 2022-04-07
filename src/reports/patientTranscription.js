import ExcelJS from "exceljs";

const HEADER_ROW_HEIGHT_PX = 25;
const ROW_HEIGHT_PX = 150;
const ROW_NUMBER_OF_HEADER = 1;
const CELL_NUMBER_OF_ALL_FREQ = 3;

const mSilico = {
  D: "Délétère",
  T: "Toléré",
};

const getOrElse = (rawValue, defaultValue) => rawValue || defaultValue;

const composeIfPossible = (strs = [], separator = "/") =>
  strs.filter((s) => !!s).join(separator);

const mZygosity = {
  HOM: "Homozygote",
  HET: "Heterozygote",
};

const translateZygosityIfNeeded = (z) =>
  ["HOM", "HET"].includes(z) ? mZygosity[z] : z;

export const makeRows = (data) => {
  const donor = data.donor || {};
  return (data.consequences || []).map((consequence, index) => {
    const geneSymbol = consequence.symbol;
    const gene = data.genes.find((g) => g.symbol === geneSymbol);
    const exonRatio = composeIfPossible([
      consequence.exon?.rank,
      consequence.exon?.total,
    ]);
    return {
      index,
      genomeBuild: [
        data.hgvsg,
        data.rsnumber,
        `Gène: ${geneSymbol}`,
        composeIfPossible([
          consequence.biotype,
          consequence.consequences?.join(" , "),
        ]),
        composeIfPossible([
          consequence.refseq_mrna_id?.join(" , "),
          consequence.ensembl_transcript_id,
        ]),
        consequence.hgvsc,
        consequence.hgvsp,
        exonRatio ? `Exon: ${exonRatio}` : "",
      ]
        .filter((e) => !!e)
        .join("\n"),
      status: [
        `${translateZygosityIfNeeded(donor.zygosity)} (${getOrElse(
          donor.transmission,
          "unknown_parents_genotype"
        )})`,
        `Couverture de la variation ${composeIfPossible([
          donor.ad_alt,
          donor.ad_total,
        ])}`,
      ].join("\n"),
      fA: data?.external_frequencies?.gnomad_exomes_2_1_1?.af ?? 0,
      pSilico: mSilico[consequence.predictions?.sift_pred] ?? 0,
      clinVar: data.clinvar
        ? `${data.clinvar.clin_sig}, (ClinVar variation ID: ${data.clinvar.clinvar_id})`
        : "0",
      omim: gene?.omim?.length
        ? gene.omim
            .map(
              (omim) =>
                `${omim.name} , (MIM: ${omim.omim_id}), (${omim.inheritance_code})`
            )
            .join("\n")
        : "0",
      interpretation: "",
      serviceRequestId: donor.service_request_id,
      sampleId: donor.sample_id,
    };
  });
};

export const makeReport = (dataSource) => {
  const dataRows = makeRows(dataSource);

  const workbook = new ExcelJS.Workbook();

  const sheet = workbook.addWorksheet("Sheet1");
  sheet.columns = [
    {
      header: `Génome Référence (${dataSource.donor.genome_build})`,
      key: "genomeBuild",
      width: 40,
    },
    { header: "Statut (origine parentale)", key: "status", width: 45 },
    { header: "Fréquence Allélique", key: "fA", width: 24 },
    { header: "Prédiction in silico", key: "pSilico", width: 24 },
    { header: "ClinVar", key: "clinVar", width: 24 },
    { header: "OMIM", key: "omim", width: 55 },
    { header: "Interprétation", key: "interpretation", width: 24 },
    { header: "Numéro requête Clin", key: "serviceRequestId", width: 24 },
    { header: "Numéro échantillon", key: "sampleId", width: 24 },
  ];
  sheet.addRows(dataRows);
  sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    const isHeaderRow = rowNumber === ROW_NUMBER_OF_HEADER;

    row.height = isHeaderRow ? HEADER_ROW_HEIGHT_PX : ROW_HEIGHT_PX;

    row.eachCell({ includeEmpty: true }, (cell, cellNumber) => {
      const isCCellExceptHeader =
        !isHeaderRow && cellNumber === CELL_NUMBER_OF_ALL_FREQ;
      cell.style = { font: { bold: isHeaderRow, size: 12, name: "Calibri" } };
      cell.alignment = {
        vertical: "bottom",
        horizontal: isCCellExceptHeader ? "right" : "left",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });
  return [workbook, sheet];
};
