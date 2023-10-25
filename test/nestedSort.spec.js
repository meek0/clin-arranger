import { expect } from "chai";
import nestedSort from "../app/middlewares/beforeES/nestedSort.js";

describe("nestedSort", () => {
  it(`Should add patient and analysis Id to ES sort`, () => {
    const query = {
        bool: {
            must: [
                {
                    bool: {
                        must: [
                            {
                                nested: {
                                    path: "donors",
                                    query: {
                                        bool: {
                                            must: [
                                                {
                                                    range: {
                                                        "donors.exomiser.gene_combined_score": {
                                                            boost: 0,
                                                            lt: 1
                                                        }
                                                    }
                                                },
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
    }
    
    const body = 
    {
        query: query,
        sort: [
            {
                "donors.exomiser.gene_combined_score": {
                    missing: "_last",
                    order: "desc",
                    nested: {
                        path: "donors"
                    }
                }
            },
            {
                max_impact_score: {
                    missing: "_last",
                    order: "desc"
                }
            },
            {
                hgvsg: {
                    missing: "_first",
                    order: "asc"
                }
            }
        ]
    }
    const expected = 
    {
        query: query,
        sort: [
            {
                "donors.exomiser.gene_combined_score": {
                    missing: "_last",
                    order: "desc",
                    nested: {
                        path: "donors",
                        filter: {
                            bool: {
                                must: [
                                {
                                    term: {
                                        "donors.patient_id": "508428"
                                    }
                                },
                                {
                                    term: {
                                        "donors.analysis_service_request_id": "508427"
                                    }
                                }
                                ]
                            }
                        }
                    }
                }
            },
            {
                max_impact_score: {
                    missing: "_last",
                    order: "desc"
                }
            },
            {
                hgvsg: {
                    missing: "_first",
                    order: "asc"
                }
            }
        ]
    }

    expect(nestedSort(body)).to.eql(expected)
  });
});
