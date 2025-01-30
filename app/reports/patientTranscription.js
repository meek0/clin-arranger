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

const consequenceBiotype = {
  'IG_C_gene': 'IG C gene',
  'IG_D_gene': 'IG D gene',
  'IG_J_gene': 'IG J gene',
  'IG_LV_gene': 'IG LV gene',
  'IG_V_gene': 'IG V gene',
  'TR_C_gene': 'TR C gene',
  'TR_J_gene': 'TR J gene',
  'TR_V_gene': 'TR V gene',
  'TR_D_gene': 'TR D gene',
  'IG_pseudogene': 'IG pseudogene',
  'IG_C_pseudogene': 'IG C pseudogene',
  'IG_J_pseudogene': 'IG J pseudogene',
  'IG_V_pseudogene': 'IG V pseudogene',
  'TR_V_pseudogene': 'TR V pseudogene',
  'TR_J_pseudogene': 'TR J pseudogene',
  'Mt_rRNA': 'Mt rRNA',
  'Mt_tRNA': 'Mt tRNA',
  'miRNA': 'miRNA',
  'misc_RNA': 'misc RNA',
  'rRNA': 'rRNA',
  'scRNA': 'scRNA',
  'snRNA': 'snRNA',
  'snoRNA': 'snoRNA',
  'ribozyme': 'ribozyme',
  'sRNA': 'sRNA',
  'scaRNA': 'scaRNA',
  'Non-coding': 'Non coding',
  'lncRNA': 'lncRNA',
  'Mt_tRNA_pseudogene': 'Mt tRNA pseudogene',
  'tRNA_pseudogene': 'tRNA pseudogene',
  'snoRNA_pseudogene': 'snoRNA pseudogene',
  'snRNA_pseudogene': 'snRNA pseudogene',
  'scRNA_pseudogene': 'scRNA pseudogene',
  'rRNA_pseudogene': 'rRNA pseudogene',
  'misc_RNA_pseudogene': 'misc RNA pseudogene',
  'miRNA_pseudogene': 'miRNA pseudogene',
  'TEC': 'TEC',
  'nonsense_mediated_decay': 'nonsense mediated decay',
  'non_stop_decay': 'non stop decay',
  'retained_intron': 'retained intron',
  'protein_coding': 'protein coding',
  'protein_coding_LoF': 'protein coding LoF',
  'protein_coding_CDS_not_defined': 'protein coding CDS not defined',
  'processed_transcript': 'processed transcript',
  'non_coding': 'non coding',
  'ambiguous_orf': 'ambiguous orf',
  'sense_intronic': 'sense intronic',
  'sense_overlapping': 'sense overlapping',
  'antisense_RNA': 'antisense RNA',
  'known_ncrna': 'known ncrna',
  'pseudogene': 'pseudogene',
  'processed_pseudogene': 'processed pseudogene',
  'polymorphic_pseudogene': 'polymorphic pseudogene',
  'retrotransposed': 'retrotransposed',
  'transcribed_processed_pseudogene': 'transcribed processed pseudogene',
  'transcribed_unprocessed_pseudogene': 'transcribed unprocessed pseudogene',
  'transcribed_unitary_pseudogene': 'transcribed unitary pseudogene',
  'translated_processed_pseudogene': 'translated processed pseudogene',
  'translated_unprocessed_pseudogene': 'translated unprocessed pseudogene',
  'unitary_pseudogene': 'unitary pseudogene',
  'unprocessed_pseudogene': 'unprocessed pseudogene',
  'artifact': 'artifact',
  'lincRNA': 'lincRNA',
  'macro_lncRNA': 'macro lncRNA',
  '3prime_overlapping_ncRNA': '3prime overlapping ncRNA',
  'disrupted_domain': 'disrupted domain',
  'vault_RNA': 'vault RNA',
  'bidirectional_promoter_lncRNA': 'bidirectional promoter lncRNA',
};

const consequencesConsequences = {
  'transcript_ablation': 'Transcript Ablation',
  'splice_acceptor_variant': 'Splice Acceptor',
  'splice_donor_variant': 'Splice Donor',
  'stop_gained': 'Stop Gained',
  'frameshift_variant': 'Frameshift',
  'stop_lost': 'Stop Lost',
  'start_lost': 'Start Lost',
  'transcript_amplification': 'Transcript Amplification',
  'inframe_insertion': 'Inframe Insertion',
  'inframe_deletion': 'Inframe Deletion',
  'missense_variant': 'Missense',
  'protein_altering_variant': 'Protein Altering',
  'splice_region_variant': 'Splice Region',
  'splice_donor_5th_base_variant': 'Splice Donor 5th Base',
  'splice_donor_region_variant': 'Splice Donor Region',
  'splice_polypyrimidine_tract_variant': 'Splice Polypyrimidine Tract',
  'incomplete_terminal_codon_variant': 'Incomplete Terminal Codon',
  'start_retained_variant': 'Start Retained',
  'stop_retained_variant': 'Stop Retained',
  'synonymous_variant': 'Synonymous',
  'coding_sequence_variant': 'Coding Sequence',
  'mature_miRNA_variant': 'Mature Mirna',
  '5_prime_UTR_variant': '5 Prime Utr',
  '3_prime_UTR_variant': '3 Prime Utr',
  'non_coding_transcript_exon_variant': 'Non Coding Transcript Exon',
  'intron_variant': 'Intron',
  'NMD_transcript_variant': 'Nmd Transcript',
  'non_coding_transcript_variant': 'Non Coding Transcript',
  'upstream_gene_variant': 'Upstream Gene',
  'downstream_gene_variant': 'Downstream Gene',
  'TFBS_ablation': 'Tfbs Ablation',
  'TFBS_amplification': 'Tfbs Amplification',
  'TF_binding_site_variant': 'Tf Binding Site',
  'regulatory_region_ablation': 'Regulatory Region Ablation',
  'regulatory_region_amplification': 'Regulatory Region Amplification',
  'feature_elongation': 'Feature Elongation',
  'regulatory_region_variant': 'Regulatory Region',
  'feature_truncation': 'Feature Truncation',
  'intergenic_variant': 'Intergenic',
};

const translateClinvar = (c) => Array.isArray(c) ? c.map(item => translateClinvarSig(item)).join(', ') : translateClinvarSig(c);

const translateZygosityIfNeeded = (z) =>
  ["HOM", "HET", "HEM"].includes(z) ? mZygosity[z] : z;

const translateOmimInheritanceCode = (c) => {
  const res = Array.isArray(c) ? c.join(', ') : c;
  return res ? `, ${c}` : '';
}

const translateExomiserMaxAcgmClassification = (ex) => {
  const val = ex ? exomiserMaxAcgmClassification[ex] : 'No Data';
  return val || ex;
};

const genomeBuildToRichtext = (genomeBuild) => {
  const res = [];
  genomeBuild.forEach((i, index) => {
    if (typeof i === 'string' && i.startsWith('Gène: ')) {
      res.push({text: 'Gène: '});
      res.push({font: {italic: true}, text: `${i.split('Gène: ')[1]}\n`});
    } else {
      res.push({text: `${i}${index === genomeBuild.length - 1 ? '' : '\n'}`});
    }
  });

  return res;
}

export const translateGnomadGenomes = (gnomad) =>
  [
    gnomad?.ac || 0,
    `${gnomad?.an || 0} (${gnomad?.hom || 0.0} hom) ${Number.parseFloat(gnomad?.af || 0).toExponential(2)}`].join(" / ");

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
      genomeBuild: { richText:
        genomeBuildToRichtext(
          [
            data.hgvsg,
            `Gène: ${geneSymbol}`,
            consequence.biotype ? consequenceBiotype[consequence.biotype] : 'No Data',
            consequence.consequences?.map(c => consequencesConsequences[c]).join(", "),
            consequence.refseq_mrna_id?.join(", "),
            consequence.hgvsc?.split(':')[1],
            exonRatio ? `Couverture de la variation ${exonRatio}` : "",
          ].filter((e) => !!e)
        )
      },
      status: [
        `${translateZygosityIfNeeded(donor.zygosity)} (${translateParentalOrigin(getOrElse(
          donor.parental_origin,
          "unknown"
        ))})`,
      ].join("\n"),
      fA: translateGnomadGenomes(data?.external_frequencies?.gnomad_genomes_4 ?? {}),
      pSilico: [
        translateExomiserMaxAcgmClassification(data.exomiser_max?.acmg_classification),
        `(${mSilico[consequence.predictions?.sift_pred] ?? 0}; Revel = ${consequence.predictions?.revel_score ?? 0}; CADD (Phred) = ${consequence.predictions?.cadd_phred ?? 0})`,
      ].join("\n"),
      clinVar: data.clinvar
        ? `${translateClinvar(data.clinvar.clin_sig)}\n(ID: ${data.clinvar.clinvar_id})`
        : "0",
      omim: gene?.omim?.length
        ? gene.omim
            .map(
              (omim) =>
                `${omim.name}\n(MIM: ${omim.omim_id}${translateOmimInheritanceCode(omim.inheritance_code)})`
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
      header: `Variation nucléotidique (${data.donor.genome_build})`,
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
