import { expect } from "chai";
import { translateParentalOrigin, makeReport } from '../app/reports/patientTranscription.js';

describe('translateParentalOrigin', () => {
  it('Should be robust', () => {
    expect(translateParentalOrigin(null)).to.equals('Inconnu');
    expect(translateParentalOrigin('foo')).to.equals('Inconnu');
  });
  it('Should return a translated parental origin', () => {
    expect(translateParentalOrigin('possible_denovo')).to.equals('Possiblement de novo');
  });
});

describe('makeReport', () => {

  const mockVariant = {
    hgvsg: "chr11:g.198062C>G",
    clinvar: {
      clin_sig: "clin sig",
      clinvar_idL: "bar",
      clinvar_id: 'clin id'
    },
    donor: {
      ad_alt: 17,
      ad_total: 34,
      service_request_id: "762051",
      sample_id: "SampleMother",
      zygosity: "HET",
      parental_origin: "unknown",
      genome_build: 'GRCh38',
    },
    external_frequencies: {
      gnomad_genomes_3_1_1: {
        af: 0.162785,
      },
    },
    rsnumber: "rs11605246",
    genes: [
      {
        symbol: "BET1L",
        omim: [
          {
            omim_id: "id",
            name: "name",
            inheritance_code: "code",
          },
        ],
      },
      {
        symbol: "ODF3",
        omim: [],
      },
    ],
    consequences: [
      {
        symbol: 'BET1L',
        ensembl_transcript_id: "ENST00000342878",
        consequences: ["downstream_gene_variant"],
        biotype: "protein_coding",
        refseq_mrna_id: ["NM_145651.3"],
      },
      {
        exon: {
          rank: 5,
          total: 10,
        },
        symbol: 'ODF3',
        ensembl_transcript_id: "ENST00000382762",
        consequences: ["downstream_gene_variant"],
        biotype: "protein_coding",
        refseq_mrna_id: ["NM_001098787.2"],
        predictions: {
          sift_pred: 'T',
        },
      },
    ],
  };

  it('Should transform variant into xlsx', () => {

    const assertColumn = (column, key, header) => {
      expect(column.key).to.equals(key);
      expect(column.header).to.equals(header);
    }

    const assertCell = (sheet, row, column, value) => {
      expect(sheet._rows[row]._cells[column]._value.value).to.equals(value);
    }

    const [workbook, sheet] = makeReport(mockVariant);

    expect(workbook.worksheets[0].name).to.equals(sheet.name);

    assertColumn(sheet.columns[0],'genomeBuild','Génome référence (GRCh38)')
    assertColumn(sheet.columns[1],'status','Statut (origine parentale)')
    assertColumn(sheet.columns[2],'fA','Fréquence allélique')
    assertColumn(sheet.columns[3],'pSilico','Prédiction in silico')
    assertColumn(sheet.columns[4],'clinVar','ClinVar')
    assertColumn(sheet.columns[5],'omim','OMIM')
    assertColumn(sheet.columns[6],'interpretation','Interprétation')
    assertColumn(sheet.columns[7],'serviceRequestId','Numéro requête CQGC')
    assertColumn(sheet.columns[8],'sampleId','Numéro échantillon')

    // row #0 contains headers

    assertCell(sheet, 1, 0, 'chr11:g.198062C>G\nrs11605246\nGène: BET1L\nprotein_coding/downstream_gene_variant\nNM_145651.3/ENST00000342878')
    assertCell(sheet, 1, 1, 'Heterozygote (Inconnu)\nCouverture de la variation 17/34')
    assertCell(sheet, 1, 2, 0.162785)
    assertCell(sheet, 1, 3, 0)
    assertCell(sheet, 1, 4, 'clin sig, (ClinVar variation ID: clin id)')
    assertCell(sheet, 1, 5, 'name , (MIM: id), (code)')
    assertCell(sheet, 1, 6, '')
    assertCell(sheet, 1, 7, '762051')
    assertCell(sheet, 1, 8, 'SampleMother')

    assertCell(sheet, 2, 0, 'chr11:g.198062C>G\nrs11605246\nGène: ODF3\nprotein_coding/downstream_gene_variant\nNM_001098787.2/ENST00000382762\nExon: 5/10')
    assertCell(sheet, 2, 1, 'Heterozygote (Inconnu)\nCouverture de la variation 17/34')
    assertCell(sheet, 2, 2, 0.162785)
    assertCell(sheet, 2, 3, 'Toléré')
    assertCell(sheet, 2, 4, 'clin sig, (ClinVar variation ID: clin id)')
    assertCell(sheet, 2, 5, '0')
    assertCell(sheet, 2, 6, '')
    assertCell(sheet, 2, 7, '762051')
    assertCell(sheet, 2, 8, 'SampleMother')
  });

});

