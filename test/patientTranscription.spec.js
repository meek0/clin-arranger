import { expect } from "chai";
import {
  translateParentalOrigin,
  translateGermlineGnomadGenomes,
  translateClinvarSig,
  makeReport,
  translateZygosityAndParentalOrigins,
  translateSomaticGnomadGenomes,
  translateCosmic,
  translateOmimPMID,
  translateSomaticInterpretation,
  translateSomaticOngogenecity,
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

describe('translateOmimPMID', () => {
  it('should return "Non répertorié" when pubmed and gene.omim are empty', () => {
    const gene = {};
    const pubmed = [];
    const result = translateOmimPMID(gene, pubmed);
    expect(result).to.equal("Non répertorié");
  });

  it('should return formatted OMIM data when gene.omim is provided', () => {
    const gene = {
      omim: [
        {
          name: 'Gene1',
          omim_id: '123456',
          inheritance_code: 'AD'
        },
        {
          name: 'Gene2',
          omim_id: '789012',
          inheritance_code: 'AR'
        }
      ]
    };
    const pubmed = [];
    const result = translateOmimPMID(gene, pubmed);
    expect(result).to.equal(
      'Gene1\n(MIM : 123456, AD)\nGene2\n(MIM : 789012, AR)'
    );
  });

  it('should return formatted PubMed data when pubmed is provided', () => {
    const gene = {};
    const pubmed = [
      { citation_id: '987654' },
      { citation_id: '321098' }
    ];
    const result = translateOmimPMID(gene, pubmed);
    expect(result).to.equal(
      'PMID : 987654\nPMID : 321098'
    );
  });

  it('should return formatted OMIM and PubMed data when both are provided', () => {
    const gene = {
      omim: [
        {
          name: 'Gene1',
          omim_id: '123456',
          inheritance_code: 'AD'
        }
      ]
    };
    const pubmed = [
      { citation_id: '987654' }
    ];
    const result = translateOmimPMID(gene, pubmed);
    expect(result).to.equal(
      'Gene1\n(MIM : 123456, AD)\nPMID : 987654'
    );
  });
});

describe('translateSomaticInterpretation', () => {
  it('should return the correct clinical utility when interpretation and consequence match', () => {
    const interpretation = { clinical_utility: 'category_ia', transcript_id: 'ENST00000367770' };
    const consequence = { ensembl_transcript_id: 'ENST00000367770' };

    const result = translateSomaticInterpretation(interpretation, consequence);
    expect(result).to.equal('Tier IA');
  });

  it('should return the correct CMC tier when data.cmc.tier is present', () => {
    const interpretation = null;
    const consequence = {};
    const data = { cmc: { tier: '1' } };

    const result = translateSomaticInterpretation(interpretation, consequence,data.cmc);
    expect(result).to.equal('COSMIC : Tier 1');
  });

  it('should return "Non répertorié" when no matching conditions are met', () => {
    const interpretation = null;
    const consequence = {};
    const data = {};

    const result = translateSomaticInterpretation(interpretation, consequence);
    expect(result).to.equal('Non répertorié');
  });
});

describe('translateSomaticOngogenecity', () => {
  it('should return the correct translation for oncogenicity when transcript IDs match', () => {
    const interpretation = { oncogenicity: 'oncogenic', transcript_id: 'ENST00000367770' };
    const consequence = { ensembl_transcript_id: 'ENST00000367770' };
    const result = translateSomaticOngogenecity(interpretation, consequence);
    expect(result).to.equal('Oncogénique');
  });

  it('should return an empty string when transcript IDs do not match', () => {
    const interpretation = { oncogenicity: 'oncogenic', transcript_id: 'ENST00000367770' };
    const consequence = { ensembl_transcript_id: 'ENST00000412345' };
    const result = translateSomaticOngogenecity(interpretation, consequence);
    expect(result).to.equal('');
  });

  it('should return an empty string when oncogenicity is not defined', () => {
    const interpretation = { transcript_id: 'ENST00000367770' };
    const consequence = { ensembl_transcript_id: 'ENST00000367770' };
    const result = translateSomaticOngogenecity(interpretation, consequence);
    expect(result).to.equal('');
  });

  it('should return the correct translation for "likely_benign"', () => {
    const interpretation = { oncogenicity: 'likely_benign', transcript_id: 'ENST00000367770' };
    const consequence = { ensembl_transcript_id: 'ENST00000367770' };
    const result = translateSomaticOngogenecity(interpretation, consequence);
    expect(result).to.equal('Probablement bénigne');
  });
});

describe('makeReport', () => {

  const mockGermlineVariant = {
    hgvsg: "chr11:g.198062C>G",
    clinvar: {
      clin_sig: "association_not_found",
      clinvar_idL: "bar",
      clinvar_id: "clin id",
    },
    donor: {
      ad_alt: 17,
      ad_total: 34,
      service_request_id: "762051",
      sample_id: "SampleMother",
      zygosity: "HET",
      parental_origin: "unknown",
      genome_build: "GRCh38",
      is_proband: true,
      variant_type: "germline",
    },
    interpretation: {
      transcript_id: "ENST00000342878",
      classification: "LA6668-3",
      pubmed: [
        {
          citation_id: "12354",
          citation:
            "Tomlinson E, Davis SS. Increased uptake of an anionic drug by mucous membrane, upon formation of ion-association species with quaternary ammonium salts [proceedings]. J Pharm Pharmacol. 1976 Dec;28 Suppl:75P. PMID: 12354.",
        },
        {
          citation_id: "6654",
          citation:
            "Jøorgensen A, Staehr P. On the biological half-life of amitroptyline. J Pharm Pharmacol. 1976 Jan;28(1):62-4. doi: 10.1111/j.2042-7158.1976.tb04026.x. PMID: 6654.",
        },
      ],
    },
    external_frequencies: {
      gnomad_genomes_3_1_1: {
        af: 0.162785,
      },
      gnomad_joint_4: {
        ac: 77907,
        af: 0.512,
        an: 152054,
        hom: 20535,
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
        symbol: "BET1L",
        hgvsc: "ENST00000342878.3:n.515+19962_515+19963del",
        ensembl_transcript_id: "ENST00000342878",
        consequences: ["downstream_gene_variant"],
        biotype: "protein_coding",
        refseq_mrna_id: ["NM_145651.3", "NM_123456"],
        mane_select: "true",
      },
      {
        exon: {
          rank: 5,
          total: 10,
        },
        symbol: "ODF3",
        ensembl_transcript_id: "ENST00000382762",
        consequences: ["downstream_gene_variant"],
        biotype: "protein_coding",
        refseq_mrna_id: ["NM_001098787.2"],
        mane_plus: "true",
        predictions: {
          sift_pred: "T",
        },
      },
    ],
  };


  const mockSomaticVariant = {
    hgvsg: "chr11:g.198062C>G",
    donor: {
      ad_alt: 17,
      ad_total: 34,
      ad_ratio: 0.0661764705882353,
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
      gnomad_joint_4: {
        ac: 77907,
        af: 0.5120,
        an: 152054,
        hom: 20535
      },
    },
    interpretation: {
      transcript_id: "ENST00000342878",
      clinical_utility: "category_ib",
      oncogenicity: "likely_oncogenic",
      pubmed: [
        {
          citation_id: "12354",
          citation:
            "Tomlinson E, Davis SS. Increased uptake of an anionic drug by mucous membrane, upon formation of ion-association species with quaternary ammonium salts [proceedings]. J Pharm Pharmacol. 1976 Dec;28 Suppl:75P. PMID: 12354.",
        },
        {
          citation_id: "6654",
          citation:
            "Jøorgensen A, Staehr P. On the biological half-life of amitroptyline. J Pharm Pharmacol. 1976 Jan;28(1):62-4. doi: 10.1111/j.2042-7158.1976.tb04026.x. PMID: 6654.",
        },
      ],
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

  const assertColumn = (column, key, header) => {
    expect(column.key).to.equals(key);
    expect(column.header).to.equals(header);
  }

  const assertCell = (sheet, row, column, value) => {
    expect(sheet._rows[row]._cells[column].text).to.equals(value);
  }

  it('Should be robust', () => {

    expect(() => makeReport({})).to.throw('Invalid data');
    expect(() => makeReport({donor: {},})).to.throw('Invalid data');
  })

  it('Should transform germline variant into xlsx', () => {

    const [workbook, sheet] = makeReport(mockGermlineVariant);

    expect(workbook.worksheets[0].name).to.equals(sheet.name);

    assertColumn(sheet.columns[0],'genomeBuild','Variation nucléotidique (GRCh38)')
    assertColumn(sheet.columns[1],'status','Zygosité et origine parentale')
    assertColumn(sheet.columns[2],'fA','Fréquence allélique¹')
    assertColumn(sheet.columns[3],'pSilico','Prédiction in silico²')
    assertColumn(sheet.columns[4],'clinVar','ClinVar')
    assertColumn(sheet.columns[5],'omim','OMIM et PMID³')
    assertColumn(sheet.columns[6],'mane','MANE')
    assertColumn(sheet.columns[7],'interpretation','Interprétation⁴')
    assertColumn(sheet.columns[8],'serviceRequestId','Numéro requête CQGC')
    assertColumn(sheet.columns[9],'sampleId','Numéro échantillon')
    assertColumn(sheet.columns[10],'citations','Citations')

    // row #0 contains headers

    assertCell(sheet, 1, 0, 'chr11:g.198062C>G\nGène : BET1L\nprotein coding\nDownstream Gene\nNM_145651.3\nNM_123456\nn.515+19962_515+19963del')
    assertCell(sheet, 1, 1, 'Zygosité Cas-index : Hétérozygote\nOrigine parentale : Inconnu')
    assertCell(sheet, 1, 2, '77907 / 152054 (20535 hom) 5.12e-1')
    assertCell(sheet, 1, 3, 'No Data\n(0; Revel = 0; CADD (Phred) = 0)')
    assertCell(sheet, 1, 4, 'Association non trouvée\n(ID : clin id)')
    assertCell(sheet, 1, 5, 'name\n(MIM : id, code)\nPMID : 12354\nPMID : 6654')
    assertCell(sheet, 1, 6, 'MANE Select\n')
    assertCell(sheet, 1, 7, 'Pathogénique')
    assertCell(sheet, 1, 8, '762051')
    assertCell(sheet, 1, 9, 'SampleMother')
    assertCell(sheet, 1, 10, 'Tomlinson E, Davis SS. Increased uptake of an anionic drug by mucous membrane, upon formation of ion-association species with quaternary ammonium salts [proceedings]. J Pharm Pharmacol. 1976 Dec;28 Suppl:75P. PMID: 12354.\nJøorgensen A, Staehr P. On the biological half-life of amitroptyline. J Pharm Pharmacol. 1976 Jan;28(1):62-4. doi: 10.1111/j.2042-7158.1976.tb04026.x. PMID: 6654.')

    assertCell(sheet, 2, 0, 'chr11:g.198062C>G\nGène : ODF3\nprotein coding\nDownstream Gene\nNM_001098787.2\nExon : 5/10')
    assertCell(sheet, 2, 1, 'Zygosité Cas-index : Hétérozygote\nOrigine parentale : Inconnu')
    assertCell(sheet, 2, 2, '77907 / 152054 (20535 hom) 5.12e-1')
    assertCell(sheet, 2, 3, 'No Data\n(Toléré; Revel = 0; CADD (Phred) = 0)')
    assertCell(sheet, 2, 4, 'Association non trouvée\n(ID : clin id)')
    assertCell(sheet, 2, 5, 'Non répertorié')
    assertCell(sheet, 2, 6, 'MANE Plus\n')
    assertCell(sheet, 2, 7, '')
    assertCell(sheet, 2, 8, '762051')
    assertCell(sheet, 2, 9, 'SampleMother')
    assertCell(sheet, 2, 10, '')
  });


  it('Should transform somatic variant into xlsx', () => {

    const [workbook, sheet] = makeReport(mockSomaticVariant);

    expect(workbook.worksheets[0].name).to.equals(sheet.name);

    assertColumn(sheet.columns[0],'genomeBuild','Variation nucléotidique (GRCh38)')
    assertColumn(sheet.columns[1],'ad','Fréquence allélique du variant [VAF] (lectures variant / total)')
    assertColumn(sheet.columns[2],'origine','Origine du variant*')
    assertColumn(sheet.columns[3],'fA','Fréquence allélique population¹')
    assertColumn(sheet.columns[4],'cosmic','Nombre de cas rapportés (COSMIC)²')
    assertColumn(sheet.columns[5],'impactFunc','Impact fonctionnel')
    assertColumn(sheet.columns[6],'interpretation','Niveau de signification clinique⁵')
    assertColumn(sheet.columns[7],'oncogenicity','Oncogénicité')
    assertColumn(sheet.columns[8],'mane','Transcrit MANE Select')
    assertColumn(sheet.columns[9],'serviceRequestId','Numéro requête CQGC')
    assertColumn(sheet.columns[10],'sampleId','Numéro échantillon')
    assertColumn(sheet.columns[11],'pmId','Publication PubMed')
    assertColumn(sheet.columns[12],'citations','Citations')

    // row #0 contains headers
    assertCell(sheet, 1, 0, 'chr11:g.198062C>G\nGène : BET1L\nprotein coding\nDownstream Gene\nNM_145651.3\nNM_123456\nn.515+19962_515+19963del')
    assertCell(sheet, 1, 1, '7%\n(17/34)')
    assertCell(sheet, 1, 2, 'Somatique')
    assertCell(sheet, 1, 3, '5.12e-1\n(nb allèles : 77907)')
    assertCell(sheet, 1, 4, '99\n(ID)')
    assertCell(sheet, 1, 5, 'Gain de fonction/Perte de fonction/Délétère/Inconnu')
    assertCell(sheet, 1, 6, 'Tier IB')
    assertCell(sheet, 1, 7, 'Probablement oncogénique')
    assertCell(sheet, 1, 8, 'Oui')
    assertCell(sheet, 1, 9, '762051')
    assertCell(sheet, 1, 10, 'SampleMother')
    assertCell(sheet, 1, 11, 'PMID : 12354\nPMID : 6654')
    assertCell(sheet, 1, 12, 'Tomlinson E, Davis SS. Increased uptake of an anionic drug by mucous membrane, upon formation of ion-association species with quaternary ammonium salts [proceedings]. J Pharm Pharmacol. 1976 Dec;28 Suppl:75P. PMID: 12354.\nJøorgensen A, Staehr P. On the biological half-life of amitroptyline. J Pharm Pharmacol. 1976 Jan;28(1):62-4. doi: 10.1111/j.2042-7158.1976.tb04026.x. PMID: 6654.')

    assertCell(sheet, 2, 0, 'chr11:g.198062C>G\nGène : ODF3\nprotein coding\nDownstream Gene\nNM_001098787.2\nExon : 5/10')
    assertCell(sheet, 2, 1, '7%\n(17/34)')
    assertCell(sheet, 2, 2, 'Somatique')
    assertCell(sheet, 2, 3, '5.12e-1\n(nb allèles : 77907)')
    assertCell(sheet, 2, 4, '99\n(ID)')
    assertCell(sheet, 2, 5, 'Gain de fonction/Perte de fonction/Délétère/Inconnu')
    assertCell(sheet, 2, 6, 'COSMIC : Tier 3')
    assertCell(sheet, 2, 7, '')
    assertCell(sheet, 2, 8, 'Non')
    assertCell(sheet, 2, 9, '762051')
    assertCell(sheet, 2, 10, 'SampleMother')
    assertCell(sheet, 2, 11, '')
    assertCell(sheet, 2, 12, '')
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

  it('Germline report should have auto filter for all column', () => {
    const [workbook, sheet] = makeReport(mockGermlineVariant);
    expect(sheet.autoFilter.from).to.equals("A1");
    expect(sheet.autoFilter.to).to.equals("K1");
  });

  it('Somatic report should have auto filter for all column', () => {
    const [workbook, sheet] = makeReport(mockSomaticVariant);
    expect(sheet.autoFilter.from).to.equals("A1");
    expect(sheet.autoFilter.to).to.equals("M1");
  });

  it('Should have centered header horizontal alignment', () => {
    const [workbook, sheet] = makeReport(mockGermlineVariant);
    sheet.getRow(1).eachCell((cell) => {
      expect(cell.alignment.horizontal).to.equals("center");
    });
  });

  it('First column should have left horizontal alignment', () => {
    const [workbook, sheet] = makeReport(mockGermlineVariant);
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        if(row._number != 1) {
          if(cell._column._number == 1)
            expect(cell.alignment.horizontal).to.equals("left");
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
    expect(result[1]).to.equal('Origine parentale : Inconnu');
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
    expect(result[1]).to.equal('Origine parentale : Mère');
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
    expect(result[1]).to.equal('Origine parentale : Père');
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
    expect(result[1]).to.equal('Origine parentale : Père et Mère');
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