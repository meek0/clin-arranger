import { extractNestedFields, groupNestedFields} from "../app/utils.js";
import { expect } from "chai";

describe("Extract from SQON nested fields with AND operator", () => {
  it(`Should retrieve all nested field - 1 field `, () => {
    const result = extractNestedFields({
      "content": [
        {
          "content": [
            {
              "content": {
                "field": "consequences.consequences",
                "index": "Variants",
                "value": [
                  "non_coding_transcript_exon_variant",
                  "downstream_gene_variant"
                ]
              },
              "op": "in"
            },
            {
              "content": {
                "field": "donors.patient_id",
                "value": [
                  "509621"
                ]
              },
              "op": "in"
            }
          ],
          "op": "and",
          "pivot": "donors"
        },
        {
          "content": [
            {
              "content": {
                "field": "consequences.biotype",
                "index": "Variants",
                "value": [
                  "TEC"
                ]
              },
              "op": "in"
            },
            {
              "content": {
                "field": "donors.patient_id",
                "value": [
                  "509621"
                ]
              },
              "op": "in"
            }
          ],
          "op": "and",
          "pivot": "donors"
        }
      ],
      "op": "and"
    });

    expect(result).to.eql(["consequences"]);
  });

  it(`Should retrieve all nested field - 2 fields`, () => {
    const result = extractNestedFields({
      "content": [
        {
          "content": [
            {
              "content": {
                "field": "consequences.consequences",
                "index": "Variants",
                "value": [
                  "non_coding_transcript_exon_variant",
                  "downstream_gene_variant"
                ]
              },
              "op": "in"
            },
            {
              "content": {
                "field": "donors.patient_id",
                "value": [
                  "509621"
                ]
              },
              "op": "in"
            }
          ],
          "op": "and",
          "pivot": "donors"
        },
        {
          "content": [
            {
              "content": {
                "field": "consequences.biotype",
                "index": "Variants",
                "value": [
                  "TEC"
                ]
              },
              "op": "in"
            },
            {
              "content": {
                "field": "donors.patient_id",
                "value": [
                  "509621"
                ]
              },
              "op": "in"
            }
          ],
          "op": "and",
          "pivot": "donors"
        },
        {
          "content": [
            {
              "content": {
                "field": "donors.ad_total",
                "index": "Variants",
                "value": [
                  "TEC"
                ]
              },
              "op": "in"
            },
            {
              "content": {
                "field": "donors.patient_id",
                "value": [
                  "509621"
                ]
              },
              "op": "in"
            }
          ],
          "op": "and",
          "pivot": "donors"
        }
      ],
      "op": "and"
    });

    expect(result).to.eql(["consequences", "donors"]);
  });

  it('should extract 2 fields', () => {
    const sqon = {
      "content": [
        {
          "content": [
            {
              "content": {
                "field": "genes.gnomad.loeuf",
                "index": "Variants",
                "value": [
                  0.45
                ]
              },
              "op": "<"
            },
            {
              "content": {
                "field": "donors.patient_id",
                "value": [
                  "509590"
                ]
              },
              "op": "in"
            }
          ],
          "op": "and",
          "pivot": "donors"
        },
        {
          "content": [
            {
              "content": {
                "field": "genes.gnomad.pli",
                "index": "Variants",
                "value": [
                  0.99
                ]
              },
              "op": "<"
            },
            {
              "content": {
                "field": "donors.patient_id",
                "value": [
                  "509590"
                ]
              },
              "op": "in"
            }
          ],
          "op": "and",
          "pivot": "donors"
        },
        {
          "content": [
            {
              "content": {
                "field": "consequences.biotype",
                "index": "Variants",
                "value": [
                  "retained_intron",
                  "TEC"
                ]
              },
              "op": "in"
            },
            {
              "content": {
                "field": "donors.patient_id",
                "value": [
                  "509590"
                ]
              },
              "op": "in"
            }
          ],
          "op": "and",
          "pivot": "donors"
        },
        {
          "content": [
            {
              "content": {
                "field": "consequences.consequences",
                "index": "Variants",
                "value": [
                  "non_coding_transcript_exon_variant",
                  "intron_variant",
                  "downstream_gene_variant",
                  "non_coding_transcript_variant"
                ]
              },
              "op": "in"
            },
            {
              "content": {
                "field": "donors.patient_id",
                "value": [
                  "509590"
                ]
              },
              "op": "in"
            }
          ],
          "op": "and",
          "pivot": "donors"
        }
      ],
      "op": "and"
    }

    expect(extractNestedFields(sqon)).to.eql(['genes', 'consequences'])
  })

  it('should combine fields and update query - 1 field', () => {
    const initialBody = {"query":{"bool":{"must":[{"bool":{"must":[{"nested":{"path":"consequences","query":{"bool":{"must":[{"terms":{"consequences.consequences":["non_coding_transcript_exon_variant","downstream_gene_variant"],"boost":0}}]}}}},{"nested":{"path":"donors","query":{"bool":{"must":[{"terms":{"donors.patient_id":["509621"],"boost":0}}]}}}}]}},{"bool":{"must":[{"nested":{"path":"consequences","query":{"bool":{"must":[{"terms":{"consequences.biotype":["TEC"],"boost":0}}]}}}},{"nested":{"path":"donors","query":{"bool":{"must":[{"terms":{"donors.patient_id":["509621"],"boost":0}}]}}}}]}},{"bool":{"must_not":[]}}]}},"sort":[{"donors.exomiser.gene_combined_score":{"missing":"_last","order":"desc","nested":{"path":"donors"}}},{"max_impact_score":{"missing":"_last","order":"desc"}},{"hgvsg":{"missing":"_first","order":"asc"}}]}

    const expectedBody = {
      "query": {
        "bool": {
          "must": [
            {
              "bool": {
                "must": [
                  {
                    "nested": {
                      "path": "consequences",
                      "query": {
                        "bool": {
                          "must": [
                            {
                              "terms": {
                                "boost": 0,
                                "consequences.consequences": [
                                  "non_coding_transcript_exon_variant",
                                  "downstream_gene_variant"
                                ]
                              }
                            },
                            {
                              "terms": {
                                "boost": 0,
                                "consequences.biotype": [
                                  "TEC"
                                ]
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  {
                    "nested": {
                      "path": "donors",
                      "query": {
                        "bool": {
                          "must": [
                            {
                              "terms": {
                                "boost": 0,
                                "donors.patient_id": [
                                  "509621"
                                ]
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            },
            {
              "bool": {
                "must": [
                  {
                    "nested": {
                      "path": "donors",
                      "query": {
                        "bool": {
                          "must": [
                            {
                              "terms": {
                                "boost": 0,
                                "donors.patient_id": [
                                  "509621"
                                ]
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            },
            {
              "bool": {
                "must_not": []
              }
            }
          ]
        }
      },
      "sort": [
        {
          "donors.exomiser.gene_combined_score": {
            "missing": "_last",
            "nested": {
              "path": "donors"
            },
            "order": "desc"
          }
        },
        {
          "max_impact_score": {
            "missing": "_last",
            "order": "desc"
          }
        },
        {
          "hgvsg": {
            "missing": "_first",
            "order": "asc"
          }
        }
      ]
    }

    expect(groupNestedFields(initialBody, ['consequences'])).to.eql(expectedBody);
  })
});
