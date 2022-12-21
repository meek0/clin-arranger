const GRAPHQL_FIELD_VARIANTS = "Variants";
const GRAPHQL_FIELD_ANALYSES = "Analyses";
const GRAPHQL_FIELD_SEQUENCINGS = "Sequencings";
const GRAPHQL_FIELD_CNV = "cnv";
const GRAPHQL_FIELD_GENES = "Genes";

// Reminder: by arranger standards, project id must be lowered case.
export const PROJECTS_IDS = {
  clin_qa: "clin_qa",
  clin_staging: "clin_staging",
  clin_prod: "clin_prod",
};

const commonMutations = [
  {
    field: "genes_symbol",
    graphqlField: GRAPHQL_FIELD_VARIANTS,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "consequences.consequences",
    graphqlField: GRAPHQL_FIELD_VARIANTS,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "donors.filters",
    graphqlField: GRAPHQL_FIELD_VARIANTS,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "clinvar.clin_sig",
    graphqlField: GRAPHQL_FIELD_VARIANTS,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "clinvar.conditions",
    graphqlField: GRAPHQL_FIELD_VARIANTS,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "clinvar.inheritance",
    graphqlField: GRAPHQL_FIELD_VARIANTS,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "donors.mother_calls",
    graphqlField: GRAPHQL_FIELD_VARIANTS,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "donors.father_calls",
    graphqlField: GRAPHQL_FIELD_VARIANTS,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "donors.hc_complement",
    graphqlField: GRAPHQL_FIELD_VARIANTS,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "donors.hc_complement.locus",
    graphqlField: GRAPHQL_FIELD_VARIANTS,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "donors.possibly_hc_complement",
    graphqlField: GRAPHQL_FIELD_VARIANTS,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "genes.omim.inheritance",
    graphqlField: GRAPHQL_FIELD_VARIANTS,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "genes.omim.inheritance_code",
    graphqlField: GRAPHQL_FIELD_VARIANTS,
    extendedFieldMappingInput: {
      isArray: true
    }
  },
  {
    field: "genes.orphanet.inheritance",
    graphqlField: GRAPHQL_FIELD_VARIANTS,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "panels",
    graphqlField: GRAPHQL_FIELD_VARIANTS,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "varsome.acmg.classifications",
    graphqlField: GRAPHQL_FIELD_VARIANTS,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "varsome.acmg.classifications.user_explain",
    graphqlField: GRAPHQL_FIELD_VARIANTS,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "consequences.refseq_mrna_id",
    graphqlField: GRAPHQL_FIELD_VARIANTS,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "varsome.publications",
    graphqlField: GRAPHQL_FIELD_VARIANTS,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "sequencing_requests",
    graphqlField: GRAPHQL_FIELD_ANALYSES,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "calls",
    graphqlField: GRAPHQL_FIELD_CNV,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "pe",
    graphqlField: GRAPHQL_FIELD_CNV,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "filters",
    graphqlField: GRAPHQL_FIELD_CNV,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "genes",
    graphqlField: GRAPHQL_FIELD_CNV,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "genes.panels",
    graphqlField: GRAPHQL_FIELD_CNV,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "alias",
    graphqlField: GRAPHQL_FIELD_GENES,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "orphanet",
    graphqlField: GRAPHQL_FIELD_GENES,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "hpo",
    graphqlField: GRAPHQL_FIELD_GENES,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "omim",
    graphqlField: GRAPHQL_FIELD_GENES,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "ddd",
    graphqlField: GRAPHQL_FIELD_GENES,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "cosmic",
    graphqlField: GRAPHQL_FIELD_GENES,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "number_of_snvs_per_patient",
    graphqlField: GRAPHQL_FIELD_GENES,
    extendedFieldMappingInput: {
      isArray: true,
    },
  },
  {
    field: "number_of_cnvs_per_patient",
    graphqlField: GRAPHQL_FIELD_GENES,
    extendedFieldMappingInput: {
      isArray: true,
    },
  }
];

const personalizeProject = (id, indices) => {
  const lambda = (x) => ({ ...x, projectId: id });
  return {
    name: id,
    indices: [...indices].map(lambda),
    extendedMappingMutations: [...commonMutations].map(lambda),
  };
};

export const projectsConfig = () => [
  {
    ...personalizeProject(PROJECTS_IDS.clin_qa, [
      {
        graphqlField: GRAPHQL_FIELD_ANALYSES,
        esIndex: "clin-qa-analyses",
      },
      {
        graphqlField: GRAPHQL_FIELD_VARIANTS,
        esIndex: "clin_qa_variant_centric",
      },
      {
        graphqlField: GRAPHQL_FIELD_SEQUENCINGS,
        esIndex: "clin-qa-sequencings",
      },
      {
        graphqlField: GRAPHQL_FIELD_CNV,
        esIndex: "clin_qa_cnv_centric",
      },
      {
        graphqlField: GRAPHQL_FIELD_GENES,
        esIndex: "clin_qa_gene_centric",
      },
    ]),
  },
  {
    ...personalizeProject(PROJECTS_IDS.clin_staging, [
      {
        graphqlField: GRAPHQL_FIELD_ANALYSES,
        esIndex: "clin-staging-analyses",
      },
      {
        graphqlField: GRAPHQL_FIELD_VARIANTS,
        esIndex: "clin_staging_variant_centric",
      },
      {
        graphqlField: GRAPHQL_FIELD_SEQUENCINGS,
        esIndex: "clin-staging-sequencings",
      },
      {
        graphqlField: GRAPHQL_FIELD_CNV,
        esIndex: "clin_staging_cnv_centric",
      },
      {
        graphqlField: GRAPHQL_FIELD_GENES,
        esIndex: "clin_staging_gene_centric",
      },
    ]),
  },
  {
    ...personalizeProject(PROJECTS_IDS.clin_prod, [
      {
        graphqlField: GRAPHQL_FIELD_ANALYSES,
        esIndex: "clin-prod-analyses",
      },
      {
        graphqlField: GRAPHQL_FIELD_VARIANTS,
        esIndex: "clin_prod_variant_centric",
      },
      {
        graphqlField: GRAPHQL_FIELD_SEQUENCINGS,
        esIndex: "clin-prod-sequencings",
      },
      {
        graphqlField: GRAPHQL_FIELD_CNV,
        esIndex: "clin_prod_cnv_centric",
      },
      {
        graphqlField: GRAPHQL_FIELD_GENES,
        esIndex: "clin_prod_gene_centric",
      },
    ]),
  },
];
