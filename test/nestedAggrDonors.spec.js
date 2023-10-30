import { expect } from "chai";
import nestedAggrDonors from "../app/middlewares/beforeAggrES/nestedAggrDonors.js";

describe("nestedAggrDonors", () => {
  it(`Should do nothing if no donors`, () => {
    const common = {
        bool: {
            must: [
                {
                    terms: {
                        "foo": [
                            "bar"
                        ],
                        boost: 0
                    }
                },
            ]
        }
    }
    const query = {
        query: {
            bool: {
                must: [
                    {
                        bool: {
                            must: [
                                {
                                    nested: {
                                        path: "foo",
                                        query: common
                                    }
                                }
                            ]
                        }
                    },
                    {
                        bool: {
                            must_not: []
                        }
                    }
                ]
            }
        },
        aggs: {
            'donors.exomiser.gene_combined_score:global': {
                global: {},
                aggs: {
                    "donors.exomiser.gene_combined_score:nested": {
                        nested: {
                            "path": "donors"
                        },
                        aggs: {
                            "donors.exomiser.gene_combined_score:stats": {
                                stats: {
                                    field: "donors.exomiser.gene_combined_score"
                                }
                            }
                        }
                    }   
                }
            }
        },
    }
    expect(nestedAggrDonors(query)).to.eql(query)
  });
  it(`Should add nested filter in aggr if donors`, () => {
    const common = {
        bool: {
            must: [
                {
                    terms: {
                        "donors.patient_id": [
                            "508428"
                        ],
                        boost: 0
                    }
                },
                {
                    terms: {
                        "donors.analysis_service_request_id": [
                            "508427"
                        ],
                        boost: 0
                    }
                }
            ]
        }
    }
    const query = {
        query: {
            bool: {
                must: [
                    {
                        bool: {
                            must: [
                                {
                                    nested: {
                                        path: "donors",
                                        query: common
                                    }
                                }
                            ]
                        }
                    },
                    {
                        bool: {
                            must_not: []
                        }
                    }
                ]
            }
        },
        aggs: {
            'donors.exomiser.gene_combined_score:global': {
                global: {},
                aggs: {
                    "donors.exomiser.gene_combined_score:nested": {
                        nested: {
                            "path": "donors"
                        },
                        aggs: {
                            "donors.exomiser.gene_combined_score:stats": {
                                stats: {
                                    field: "donors.exomiser.gene_combined_score"
                                }
                            }
                        }
                    }   
                }
            }
        },
    }
    const expected = {
        query: {
            bool: {
                must: [
                    {
                        bool: {
                            must: [
                                {
                                    nested: {
                                        path: "donors",
                                        query: common
                                    }
                                }
                            ]
                        }
                    },
                    {
                        bool: {
                            must_not: []
                        }
                    }
                ]
            }
        },
        aggs: {
            "donors.exomiser.gene_combined_score:global": {
                aggs: {
                    "donors.exomiser.gene_combined_score:nested": {
                        aggs: {
                            filter_patient: {
                                aggs: {
                                    filter_analysis: {
                                        aggs: {
                                            "donors.exomiser.gene_combined_score:stats": {
                                                stats: {
                                                field: "donors.exomiser.gene_combined_score"
                                                }
                                            }
                                        },
                                        filter: {
                                            terms: {
                                                "donors.analysis_service_request_id": [
                                                "508427"
                                                ]
                                            }
                                        }
                                    }
                                },
                                filter: {
                                    terms: {
                                        "donors.patient_id": [
                                        "508428"
                                        ]
                                    }
                                }
                            }
                        },
                        nested: {
                            path: "donors"
                        }
                    }
                },
                global: {}
            }
        }
    }
    expect(nestedAggrDonors(query)).to.eql(expected)
  });
});
