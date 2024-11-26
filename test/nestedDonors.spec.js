import { expect } from "chai";
import nestedDonors from "../app/middlewares/beforeES/nestedDonors.js";

describe("nestedDonors", () => {
  it(`Should add inner_hits ES query`, () => {
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
        }
    }

    const expected = {
        _source: {
            includes: [
              "*"
            ],
            excludes: [
              "donors"
            ]
          },
        query: {
            bool: {
                must: [
                    {
                        bool: {
                            must: [
                                {
                                    nested: {
                                        path: "donors",
                                        inner_hits: {
                                            _source: [
                                            "donors.*"
                                            ]
                                        },
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
        }
    }

    expect(nestedDonors(query)).to.eql(expected)
  });

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
        }
    }
    expect(nestedDonors(query)).to.eql(query)
  });

  it(`Should not add inner_hits if multiple nested donors ES query`, () => {
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
                                        query: {
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
                                    }
                                }
                            ]
                        }
                    },
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
                                                        terms: {
                                                            "donors.patient_id": [
                                                                "508430"
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
                ]
            }
        }
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
                                        query: {
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
                                    }
                                }
                            ]
                        }
                    },
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
                                                        terms: {
                                                            "donors.patient_id": [
                                                                "508430"
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
                    }
                ]
            }
        }
    }

    expect(nestedDonors(query)).to.eql(expected)
  });


  /*
  it(`Should add inner_hits if multiple same nested donors ES query`, () => {
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
                ]
            }
        }
    }

    const expected = {
        _source: {
            excludes: [
                "donors"
            ],
            includes: [
                "*"
            ]
        },
        query: {
            bool: {
                must: [
                    {
                        nested: {
                            inner_hits: {
                                _source: [
                                  "donors.*"
                                ]
                            },
                            path: "donors",
                            query: common
                        }
                    }
                ]
            }
        }
    }

    expect(nestedDonors(query)).to.eql(expected)
  });
  */
});
