import { expect } from "chai";
import { makeRows } from "../src/reports/patientTranscription.js";

const donor = {
  patient_id: "PA00001",
  aliquot_id: "16774",
  dp: 2,
  gq: 4,
  calls: [0, 1],
  qd: 18.57,
  has_alt: true,
  filters: ["PASS"],
  ad_ref: 1,
  ad_alt: 1,
  ad_total: 2,
  ad_ratio: 0.5,
  hgvsg: "chr11:g.5363305C>T",
  genome_build: "GRCh38",
  zygosity: "HET",
  service_request_id: "srix",
  sample_id: "six",
};

const rawData = {
  genes_symbol: ["HBE1", "HBG2", "AC104389.5", "AC104389.4"],
  hgvsg: "chr11:g.5363305C>T",
  variant_type: "germline",
  donors: [{ ...donor }],
  external_frequencies: {
    gnomad_genomes_2_1_1: {
      ac: 8520,
      af: 0.3355916180872853,
      an: 25388,
      hom: 1747,
    },
  },
  rsnumber: "rs2647604",
  genes: [
    {
      symbol: "HBE1",
      omim_gene_id: "142100",
      hgnc: "HGNC:4830",
      ensembl_gene_id: "ENSG00000213931",
      name: "hemoglobin subunit epsilon 1",
      alias: ["HBE"],
      biotype: "protein_coding",
      orphanet: [],
      omim: [],
    },
    {
      symbol: "HBG2",
      omim_gene_id: "142250",
      hgnc: "HGNC:4832",
      ensembl_gene_id: "ENSG00000196565",
      name: "hemoglobin subunit gamma 2",
      alias: ["HBG-T1", "TNCY"],
      biotype: "protein_coding",
      omim: [
        {
          name: "Cyanosis, transient neonatal",
          omim_id: "613977",
          inheritance: ["Autosomal dominant"],
          inheritance_code: ["AD"],
        },
        {
          name: "Fetal hemoglobin quantitative trait locus 1",
          omim_id: "141749",
          inheritance: ["Autosomal dominant"],
          inheritance_code: ["AD"],
        },
      ],
    },
  ],
  omim: ["613977", "141749"],
  consequences: [
    {
      ensembl_transcript_id: "ENST00000380259",
      ensembl_gene_id: "ENSG00000239920",
      consequences: ["intron_variant", "NMD_transcript_variant"],
      symbol: "HBE1",
      biotype: "nonsense_mediated_decay",
      intron: { rank: 5, total: 7 },
      hgvsc: "ENST00000380259.7:c.*740-17406G>A",
      consequence: ["intron", "NMD transcript"],
    },
    {
      ensembl_transcript_id: "ENST00000445629",
      ensembl_gene_id: "ENSG00000236248",
      consequences: ["downstream_gene_variant"],
      symbol: "AC104389.4",
      biotype: "processed_pseudogene",
      pick: true,
      original_canonical: true,
      consequence: ["downstream gene"],
    },
  ],
};

describe("Transcription Repost", () => {
  it(`Should create adequate rows from raw data`, () => {
    expect(makeRows({ donor, ...rawData })).to.include.deep.members([
      {
        index: 0,
        genomeBuild:
          "GRCh38\nchr11:g.5363305C>T\nrs2647604\nGène: HBE1\nENST00000380259\nnonsense_mediated_decay/intron_variant , NMD_transcript_variant\nENST00000380259",
        status:
          "HET\n(unknown_parents_genotype)\nCouverture de la variation 1/2",
        fA: "3.36e-1",
        pSilico: "0",
        clinVar: "0",
        omim: "0",
        interpretation: "",
        serviceRequestId: "srix",
        sampleId: "six",
      },
      {
        index: 1,
        genomeBuild:
          "GRCh38\nchr11:g.5363305C>T\nrs2647604\nGène: AC104389.4\nENST00000445629\nprocessed_pseudogene/downstream_gene_variant\nENST00000445629",
        status:
          "HET\n(unknown_parents_genotype)\nCouverture de la variation 1/2",
        fA: "3.36e-1",
        pSilico: "0",
        clinVar: "0",
        omim: "0",
        interpretation: "",
        serviceRequestId: "srix",
        sampleId: "six",
      },
    ]);
  });
});
