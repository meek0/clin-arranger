import logger from "../../config/logger.js";
import { isHeader } from "./reportUtils.js";
import Report from "./index.js";

const HEADER_ROW_HEIGHT_PX = 25;
const ROW_HEIGHT_PX = 150;
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
  HEM: "Hémizygote"
};

const parentalOrigins = {
  'possible_denovo': 'Possiblement de novo',
  'possible_mother': 'Possiblement mère',
  'possible_father': 'Possiblement père',
  'denovo': 'de novo',
  'mother': 'Mère',
  'father': 'Père',
  'both': 'Père et Mère',
  'ambiguous': 'Indéterminé',
  'unknown': 'Inconnu',
};

const clinvarSig = {
  'Affects': 'Affecte',
  'association': 'Association',
  'association_not_found': 'Association non trouvée',
  'Benign': 'Bénigne',
  'confers_sensitivity': 'Confère une sensibilité',
  'Conflicting_classifications_of_pathogenicity': 'Classifications conflictuelles',
  'Conflicting_interpretations_of_pathogenicity': 'Interprétations conflictuelles',
  'drug_response': 'Réponse au médicament',
  'Likely_benign': 'Probablement bénigne',
  'Likely_pathogenic': 'Probablement pathogénique',
  'Likely_risk_allele': 'Allèle de risque probable',
  'low_penetrance': 'Faible pénétrance',
  'no_classification_for_the_single_variant': 'Pas de classification pour le variant unique',
  'not_provided': 'Non fourni',
  'other': 'Autre',
  'Pathogenic': 'Pathogénique',
  'protective': 'Protecteur',
  'risk_factor': 'Facteur de risque',
  'Uncertain_risk_allele': 'Allèle à risque incertain',
  'Uncertain_significance': 'De signification incertaine',
};

const exomiserMaxAcgmClassification = {
  'PATHOGENIC': 'Pathogénique',
  'LIKELY_PATHOGENIC': 'Probablement pathogénique',
  'UNCERTAIN_SIGNIFICANCE': 'Variant de signification incertaine',
  'LIKELY_BENIGN': 'Probablement bénigne',
  'BENIGN': 'Bénigne',
  'POSSIBLY_PATHOGENIC_MODERATE': 'Variant de signification incertaine',
  'POSSIBLY_PATHOGENIC_BENIGN': 'Variant de signification incertaine',
  'POSSIBLY_PATHOGENIC_LOW': 'Variant de signification incertaine',
  'POSSIBLY_BENIGN': 'Variant de signification incertaine',
};

const translateZygosityIfNeeded = (z) =>
  ["HOM", "HET", "HEM"].includes(z) ? mZygosity[z] : z;

const translateExomiserMaxAcgmClassification = (ex) => {
  const val = ex ? exomiserMaxAcgmClassification[ex] : 'No Data';
  return val || ex;
};

export const translateGnomadGenomes = (gnomad) =>
  [gnomad?.ac || 0, `${gnomad?.an || 0} (${gnomad?.hom || 0.0} hom) ${gnomad?.af || 0}`].join("\n");

export const translateClinvarSig = (sig) => {
  const val = sig ? clinvarSig[sig] : 'Aucune donnée';
  return val || sig;
}

export const translateParentalOrigin = (origin) => {
  const sanitizedOrigin = origin?.toLowerCase();
  const translatedOrigin = parentalOrigins[sanitizedOrigin];
  if (!translatedOrigin) {
    logger.warn(`Missing parental origin translation for: ${origin}`)
  }
  return translatedOrigin || parentalOrigins['unknown']
}

/**
 * @param {{
 * donor,
 * consequences,
 * genes: Object[],
 * external_frequencies: Object[],
 * hgvsg: string,
 * rsnumber: string
 * }} data - variant
 */
const makeRows = (data) => {
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
        `Gène: ${geneSymbol}`,
        composeIfPossible([
          consequence.biotype,
          consequence.consequences?.join(", "),
        ]),
        consequence.refseq_mrna_id?.join(", "),
        exonRatio ? `Exon: ${exonRatio}` : "",
      ]
        .filter((e) => !!e)
        .join("\n"),
      status: [
        `${translateZygosityIfNeeded(donor.zygosity)} (${translateParentalOrigin(getOrElse(
          donor.parental_origin,
          "unknown"
        ))})`,
        `Couverture de la variation ${composeIfPossible([
          donor.ad_alt,
          donor.ad_total,
        ])}`,
      ].join("\n"),
      fA: translateGnomadGenomes(data?.external_frequencies?.gnomad_genomes_4 ?? {}),
      pSilico: [
        translateExomiserMaxAcgmClassification(data.exomiser_max?.acmg_classification),
        `(${mSilico[consequence.predictions?.sift_pred] ?? 0}; Revel = ${consequence.predictions?.revel_score ?? 0}; CADD (Phred) = ${consequence.predictions?.cadd_phred ?? 0})`,
      ].join("\n"),
      clinVar: data.clinvar
        ? `${translateClinvarSig(data.clinvar.clin_sig)}\n(ID: ${data.clinvar.clinvar_id})`
        : "0",
      omim: gene?.omim?.length
        ? gene.omim
            .map(
              (omim) =>
                `${omim.name}\n(MIM: ${omim.omim_id}, ${omim.inheritance_code})`
            )
            .join("\n")
        : "0",
      interpretation: "",
      serviceRequestId: donor.service_request_id,
      sampleId: donor.sample_id,
    };
  });
};

export const makeReport = (data) => {
  const columns = [
    {
      header: `Génome référence (${data.donor.genome_build})`,
      key: "genomeBuild",
      width: 40,
    },
    { header: "Statut (origine parentale)", key: "status", width: 45 },
    { header: "Fréquence allélique¹", key: "fA", width: 24 },
    { header: "Prédiction in silico²", key: "pSilico", width: 24 },
    { header: "ClinVar", key: "clinVar", width: 24 },
    { header: "OMIM³", key: "omim", width: 55 },
    { header: "Interprétation⁴", key: "interpretation", width: 24 },
    { header: "Numéro requête CQGC", key: "serviceRequestId", width: 24 },
    { header: "Numéro échantillon", key: "sampleId", width: 24 },
  ];

  const rows = makeRows(data);
  return new Report(columns, rows)
    .eachRowExtra((row, rowNumber) => {
      const isHeaderRow = isHeader(rowNumber);
      row.height = isHeaderRow ? HEADER_ROW_HEIGHT_PX : ROW_HEIGHT_PX;
    })
    .eachCellExtra((cell, cellNumber, isHeaderRow) => {
      const isCCellExceptHeader =
        !isHeaderRow && cellNumber === CELL_NUMBER_OF_ALL_FREQ;
      cell.alignment = {
        ...cell.alignment,
        horizontal: isCCellExceptHeader ? "right" : "left",
      };
    })
    .build();
};
