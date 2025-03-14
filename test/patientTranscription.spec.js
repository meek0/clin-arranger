import { expect } from "chai";
import {
  translateParentalOrigin,
  translateGermlineGnomadGenomes,
  translateClinvarSig,
  makeReport,
  translateZygosityAndParentalOrigins,
  translateSomaticGnomadGenomes,
  translateCosmic,
} from "../app/reports/patientTranscription.js";

describe('translateParentalOrigin', () => {
  it('Should be robust', () => {
    expect(translateParentalOrigin(null)).to.equals('Inconnu');
    expect(translateParentalOrigin('foo')).to.equals('Inconnu');
  });
  it('Should return a translated parental origin', () => {
    expect(translateParentalOrigin('possible_denovo')).to.equals('Possiblement de novo');
  });
  it('Should return an un translated clinvar sig', () => {
    expect(translateClinvarSig('test')).to.equals('test');
  });
  it('Should return a translated clinvar sig', () => {
    expect(translateClinvarSig('not_provided')).to.equals('Non fourni');
  });
});


describe('translateGnomadGenomes', () => {
  it('Should translate Germline GnomAD', () => {
    expect(translateGermlineGnomadGenomes({an: 10, af: 0.123, ac: 1230, hom: 20})).to.equals('1230 / 10 (20 hom) 1.23e-1');
  });

  it('Should translate Somatic GnomAD', () => {
    expect(translateSomaticGnomadGenomes({an: 10, af: 0.123, ac: 1230, hom: 20})).to.equals('1.23e-1\n(nb allèles : 1230)');
  });

  it('Should translate null GnomAD', () => {
    expect(translateSomaticGnomadGenomes()).to.equals('Non répertoriée');
    expect(translateSomaticGnomadGenomes({})).to.equals('Non répertoriée');
    expect(translateSomaticGnomadGenomes({af: 0.123})).to.equals('Non répertoriée');
    expect(translateSomaticGnomadGenomes({ac: 1230})).to.equals('Non répertoriée');
  });
});

describe('translateCosmic', () => {
  it('Should translate Cosmic', () => {
    expect(translateCosmic({cosmic_id:"ID", sample_mutated:99})).to.equals('99\n(ID)');
  });

  it('Should translate null Cosmic', () => {
    expect(translateCosmic()).to.equals('Non répertoriée');
    expect(translateCosmic({})).to.equals('Non répertoriée');
    expect(translateCosmic({cosmic_id:"ID"})).to.equals('Non répertoriée');
    expect(translateCosmic({sample_mutated:99})).to.equals('Non répertoriée');
  });
});

describe('makeReport', () => {

  const mockGermlineVariant = {
    hgvsg: "chr11:g.198062C>G",
    clinvar: {
      clin_sig: "association_not_found",
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
      is_proband: true,
      variant_type: "germline"
    },
    external_frequencies: {
      gnomad_genomes_3_1_1: {
        af: 0.162785,
      },
      gnomad_genomes_4: {
        ac: 77907,
        af: 0.5120,
        an: 152054,
        hom: 20535
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
        hgvsc: 'ENST00000342878.3:n.515+19962_515+19963del',
        ensembl_transcript_id: "ENST00000342878",
        consequences: ["downstream_gene_variant"],
        biotype: "protein_coding",
        refseq_mrna_id: ["NM_145651.3","NM_123456"],
        mane_select: 'true',
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
        mane_plus: 'true',
        predictions: {
          sift_pred: 'T',
        },
      },
    ],
  };


  const mockSomaticVariant = {
    hgvsg: "chr11:g.198062C>G",
    donor: {
      ad_alt: 17,
      ad_total: 34,
      ad_ratio: 0.75,
      service_request_id: "762051",
      sample_id: "SampleMother",
      zygosity: "HET",
      parental_origin: "unknown",
      genome_build: 'GRCh38',
      is_proband: true,
      variant_type: "somatic",
      all_analyses:["TN"],
    },
    cmc:{
      cosmic_id:"ID",
      sample_mutated:99,
      tier:3,
    },
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
    external_frequencies: {
      gnomad_genomes_4: {
        ac: 77907,
        af: 0.5120,
        an: 152054,
        hom: 20535
      },
    },
    consequences: [
      {
        symbol: 'BET1L',
        hgvsc: 'ENST00000342878.3:n.515+19962_515+19963del',
        ensembl_transcript_id: "ENST00000342878",
        consequences: ["downstream_gene_variant"],
        biotype: "protein_coding",
        refseq_mrna_id: ["NM_145651.3","NM_123456"],
        mane_select: 'true',
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
        mane_plus: 'true',
        predictions: {
          sift_pred: 'T',
        },
      },
    ],
  };

  it('Should transform germline variant into xlsx', () => {

    const assertColumn = (column, key, header) => {
      expect(column.key).to.equals(key);
      expect(column.header).to.equals(header);
    }

    const assertCell = (sheet, row, column, value) => {
      expect(sheet._rows[row]._cells[column].text).to.equals(value);
    }

    const [workbook, sheet] = makeReport(mockGermlineVariant);

    expect(workbook.worksheets[0].name).to.equals(sheet.name);

    assertColumn(sheet.columns[0],'genomeBuild','Variation nucléotidique (GRCh38)')
    assertColumn(sheet.columns[1],'status','Zygosité et origine parentale')
    assertColumn(sheet.columns[2],'fA','Fréquence allélique¹')
    assertColumn(sheet.columns[3],'pSilico','Prédiction in silico²')
    assertColumn(sheet.columns[4],'clinVar','ClinVar')
    assertColumn(sheet.columns[5],'omim','OMIM³')
    assertColumn(sheet.columns[6],'mane','MANE')
    assertColumn(sheet.columns[7],'interpretation','Interprétation⁴')
    assertColumn(sheet.columns[8],'serviceRequestId','Numéro requête CQGC')
    assertColumn(sheet.columns[9],'sampleId','Numéro échantillon')

    // row #0 contains headers

    assertCell(sheet, 1, 0, 'chr11:g.198062C>G\nGène : BET1L\nprotein coding\nDownstream Gene\nNM_145651.3\nNM_123456\nn.515+19962_515+19963del')
    assertCell(sheet, 1, 1, 'Zygosité Cas-index : Hétérozygote\nOrigine Parentale : Inconnu')
    assertCell(sheet, 1, 2, '77907 / 152054 (20535 hom) 5.12e-1')
    assertCell(sheet, 1, 3, 'No Data\n(0; Revel = 0; CADD (Phred) = 0)')
    assertCell(sheet, 1, 4, 'Association non trouvée\n(ID : clin id)')
    assertCell(sheet, 1, 5, 'name\n(MIM : id, code)')
    assertCell(sheet, 1, 6, 'MANE Select\n')
    assertCell(sheet, 1, 7, '')
    assertCell(sheet, 1, 8, '762051')
    assertCell(sheet, 1, 9, 'SampleMother')

    assertCell(sheet, 2, 0, 'chr11:g.198062C>G\nGène : ODF3\nprotein coding\nDownstream Gene\nNM_001098787.2\nExon : 5/10')
    assertCell(sheet, 2, 1, 'Zygosité Cas-index : Hétérozygote\nOrigine Parentale : Inconnu')
    assertCell(sheet, 2, 2, '77907 / 152054 (20535 hom) 5.12e-1')
    assertCell(sheet, 2, 3, 'No Data\n(Toléré; Revel = 0; CADD (Phred) = 0)')
    assertCell(sheet, 2, 4, 'Association non trouvée\n(ID : clin id)')
    assertCell(sheet, 2, 5, 'Non répertorié')
    assertCell(sheet, 2, 6, 'MANE Plus\n')
    assertCell(sheet, 2, 7, '')
    assertCell(sheet, 2, 8, '762051')
    assertCell(sheet, 2, 9, 'SampleMother')
  });


  it('Should transform somatic variant into xlsx', () => {

    const assertColumn = (column, key, header) => {
      expect(column.key).to.equals(key);
      expect(column.header).to.equals(header);
    }

    const assertCell = (sheet, row, column, value) => {
      expect(sheet._rows[row]._cells[column].text).to.equals(value);
    }

    const [workbook, sheet] = makeReport(mockSomaticVariant);

    expect(workbook.worksheets[0].name).to.equals(sheet.name);

    assertColumn(sheet.columns[0],'genomeBuild','Variation nucléotidique (GRCh38)')
    assertColumn(sheet.columns[1],'ad','Fréquence allélique du variant [VAF] (lectures variant / total)')
    assertColumn(sheet.columns[2],'origine','Origine du variant*')
    assertColumn(sheet.columns[3],'fA','Fréquence allélique population¹')
    assertColumn(sheet.columns[4],'cosmic','Nombre de cas rapportés (COSMIC)²')
    assertColumn(sheet.columns[5],'impactFunc','Impact fonctionnel')
    assertColumn(sheet.columns[6],'interpretation','Niveau de signification clinique⁵')
    assertColumn(sheet.columns[7],'mane','Transcrit MANE Select')
    assertColumn(sheet.columns[8],'serviceRequestId','Numéro requête CQGC')
    assertColumn(sheet.columns[9],'sampleId','Numéro échantillon')

    // row #0 contains headers
    assertCell(sheet, 1, 0, 'chr11:g.198062C>G\nGène : BET1L\nprotein coding\nDownstream Gene\nNM_145651.3\nNM_123456\nn.515+19962_515+19963del')
    assertCell(sheet, 1, 1, '75%\n17/34')
    assertCell(sheet, 1, 2, 'Somatique')
    assertCell(sheet, 1, 3, '5.12e-1\n(nb allèles : 77907)')
    assertCell(sheet, 1, 4, '99\n(ID)')
    assertCell(sheet, 1, 5, 'Gain de fonction/Perte de fonction/Délétère/Inconnu')
    assertCell(sheet, 1, 6, 'Tier 3')
    assertCell(sheet, 1, 7, 'Oui')
    assertCell(sheet, 1, 8, '762051')
    assertCell(sheet, 1, 9, 'SampleMother')

    assertCell(sheet, 2, 0, 'chr11:g.198062C>G\nGène : ODF3\nprotein coding\nDownstream Gene\nNM_001098787.2\nExon : 5/10')
    assertCell(sheet, 2, 1, '75%\n17/34')
    assertCell(sheet, 2, 2, 'Somatique')
    assertCell(sheet, 2, 3, '5.12e-1\n(nb allèles : 77907)')
    assertCell(sheet, 2, 4, '99\n(ID)')
    assertCell(sheet, 2, 5, 'Gain de fonction/Perte de fonction/Délétère/Inconnu')
    assertCell(sheet, 2, 6, 'Tier 3')
    assertCell(sheet, 2, 7, 'Non')
    assertCell(sheet, 2, 8, '762051')
    assertCell(sheet, 2, 9, 'SampleMother')
  });

  it('All cells should have same font name and size', () => {
    const fontSettings = {
      name: 'Arial',
      size: 9
    };
    const [workbook, sheet] = makeReport(mockGermlineVariant);

    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        expect(cell.font.name).to.equals(fontSettings.name);
        expect(cell.font.size).to.equals(fontSettings.size);
      });
    });
  });

  it('Should have auto filter for all column', () => {
    const [workbook, sheet] = makeReport(mockGermlineVariant);
    expect(sheet.autoFilter.from).to.equals("A1");
    expect(sheet.autoFilter.to).to.equals("J1");
  });

  it('Should have centered header horizontal alignment', () => {
    const [workbook, sheet] = makeReport(mockGermlineVariant);
    sheet.getRow(1).eachCell((cell) => {
      expect(cell.alignment.horizontal).to.equals("center");
    });
  });

  it('Should first column left horizontal alignment', () => {
    const [workbook, sheet] = makeReport(mockGermlineVariant);
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        if(row._number != 1) {
          if(cell._column._number == 1)
            expect(cell.alignment.horizontal).to.equals("left");
          else
            expect(cell.alignment.horizontal).to.equals("center");
        }
      });
    });
  });

});

describe('FormatZygosityAndParentalOrigins', () => {
  it('should handle unknown parental origin', () => {
    const donor = {
      zygosity: 'HOM',
      parental_origin: 'unknown',
      mother_zygosity: 'HET',
      father_zygosity: 'HEM',
      is_proband: true,
    };

    const result = translateZygosityAndParentalOrigins(donor);
    expect(result[0]).to.equal('Zygosité Cas-index : Homozygote');
    expect(result[1]).to.equal('Origine Parentale : Inconnu');
  });

  it('should handle mother parental origin', () => {
    const donor = {
      zygosity: 'HOM',
      parental_origin: 'mother',
      mother_zygosity: 'HET',
      father_zygosity: 'HEM',
      is_proband: true,
    };

    const result = translateZygosityAndParentalOrigins(donor);
    expect(result[0]).to.equal('Zygosité Cas-index : Homozygote');
    expect(result[1]).to.equal('Origine Parentale : Mère');
    expect(result[2]).to.equal('Zygosité maternelle : Hétérozygote');
  });

  it('should handle father parental origin', () => {
    const donor = {
      zygosity: 'HOM',
      parental_origin: 'father',
      mother_zygosity: 'HET',
      father_zygosity: 'HEM',
      is_proband: true,
    };

    const result = translateZygosityAndParentalOrigins(donor);
    expect(result[0]).to.equal('Zygosité Cas-index : Homozygote');
    expect(result[1]).to.equal('Origine Parentale : Père');
    expect(result[2]).to.equal('Zygosité paternelle : Hémizygote');
  });

  it('should handle father both origin', () => {
    const donor = {
      zygosity: 'HOM',
      parental_origin: 'both',
      mother_zygosity: 'HET',
      father_zygosity: 'HEM',
      is_proband: true,
    };

    const result = translateZygosityAndParentalOrigins(donor);
    expect(result[0]).to.equal('Zygosité Cas-index : Homozygote');
    expect(result[1]).to.equal('Origine Parentale : Père et Mère');
    expect(result[2]).to.equal('Zygosité maternelle : Hétérozygote');
    expect(result[3]).to.equal('Zygosité paternelle : Hémizygote');
  });

  it('should handle not proband', () => {
    const donor = {
      zygosity: 'HOM',
      parental_origin: 'both',
      mother_zygosity: 'HET',
      father_zygosity: 'HEM',
      is_proband: false,
    };

    const result = translateZygosityAndParentalOrigins(donor);
    expect(result[0]).to.equal('Zygosité : Homozygote');
    expect(result.length).to.equal(1);
  });
});