import { expect } from "chai";
import _ from 'lodash';
import { optimiseBooleanQuery, addInnerHitsDonorsPath } from '../app/middlewares/beforeES/nestedDonors.js';

describe("query optimizer", () => {
    it(`Should optimize bool query`, () => {
        const initialQuery = {
            "bool": {
                "must": [
                    {
                        "bool": {
                            "should": [
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
                                                                    "range": {
                                                                        "donors.gq": {
                                                                            "boost": 0,
                                                                            "gte": 200
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    "terms": {
                                                                        "donors.patient_id": [
                                                                            "1282129"
                                                                        ],
                                                                        "boost": 0
                                                                    }
                                                                },
                                                                {
                                                                    "terms": {
                                                                        "donors.analysis_service_request_id": [
                                                                            "1282128"
                                                                        ],
                                                                        "boost": 0
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
                                                            "must_not": [
                                                                {
                                                                    "exists": {
                                                                        "field": "donors.gq",
                                                                        "boost": 0
                                                                    }
                                                                }
                                                            ],
                                                            "must": [
                                                                {
                                                                    "terms": {
                                                                        "donors.patient_id": [
                                                                            "1282129"
                                                                        ],
                                                                        "boost": 0
                                                                    }
                                                                },
                                                                {
                                                                    "terms": {
                                                                        "donors.analysis_service_request_id": [
                                                                            "1282128"
                                                                        ],
                                                                        "boost": 0
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
                                                                    "range": {
                                                                        "donors.ad_alt": {
                                                                            "boost": 0,
                                                                            "gte": 500
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    "terms": {
                                                                        "donors.patient_id": [
                                                                            "1282129"
                                                                        ],
                                                                        "boost": 0
                                                                    }
                                                                },
                                                                {
                                                                    "terms": {
                                                                        "donors.analysis_service_request_id": [
                                                                            "1282128"
                                                                        ],
                                                                        "boost": 0
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
                                                            "must_not": [
                                                                {
                                                                    "exists": {
                                                                        "field": "donors.ad_alt",
                                                                        "boost": 0
                                                                    }
                                                                }
                                                            ],
                                                            "must": [
                                                                {
                                                                    "terms": {
                                                                        "donors.patient_id": [
                                                                            "1282129"
                                                                        ],
                                                                        "boost": 0
                                                                    }
                                                                },
                                                                {
                                                                    "terms": {
                                                                        "donors.analysis_service_request_id": [
                                                                            "1282128"
                                                                        ],
                                                                        "boost": 0
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
                                                                        "donors.parental_origin": [
                                                                            "denovo"
                                                                        ],
                                                                        "boost": 0
                                                                    }
                                                                },
                                                                {
                                                                    "terms": {
                                                                        "donors.patient_id": [
                                                                            "1282129"
                                                                        ],
                                                                        "boost": 0
                                                                    }
                                                                },
                                                                {
                                                                    "terms": {
                                                                        "donors.analysis_service_request_id": [
                                                                            "1282128"
                                                                        ],
                                                                        "boost": 0
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
                                                                        "donors.filters": [
                                                                            "long_indel"
                                                                        ],
                                                                        "boost": 0
                                                                    }
                                                                },
                                                                {
                                                                    "terms": {
                                                                        "donors.patient_id": [
                                                                            "1282129"
                                                                        ],
                                                                        "boost": 0
                                                                    }
                                                                },
                                                                {
                                                                    "terms": {
                                                                        "donors.analysis_service_request_id": [
                                                                            "1282128"
                                                                        ],
                                                                        "boost": 0
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
                                                "bool": {
                                                    "should": [
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
                                                                                            "range": {
                                                                                                "donors.gq": {
                                                                                                    "boost": 0,
                                                                                                    "lt": 20
                                                                                                }
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "terms": {
                                                                                                "donors.patient_id": [
                                                                                                    "1282129"
                                                                                                ],
                                                                                                "boost": 0
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "terms": {
                                                                                                "donors.analysis_service_request_id": [
                                                                                                    "1282128"
                                                                                                ],
                                                                                                "boost": 0
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
                                                                                    "must_not": [
                                                                                        {
                                                                                            "exists": {
                                                                                                "field": "donors.gq",
                                                                                                "boost": 0
                                                                                            }
                                                                                        }
                                                                                    ],
                                                                                    "must": [
                                                                                        {
                                                                                            "terms": {
                                                                                                "donors.patient_id": [
                                                                                                    "1282129"
                                                                                                ],
                                                                                                "boost": 0
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "terms": {
                                                                                                "donors.analysis_service_request_id": [
                                                                                                    "1282128"
                                                                                                ],
                                                                                                "boost": 0
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
                                                                                    "donors.transmission": [
                                                                                        "autosomal_dominant_de_novo"
                                                                                    ],
                                                                                    "boost": 0
                                                                                }
                                                                            },
                                                                            {
                                                                                "terms": {
                                                                                    "donors.patient_id": [
                                                                                        "1282129"
                                                                                    ],
                                                                                    "boost": 0
                                                                                }
                                                                            },
                                                                            {
                                                                                "terms": {
                                                                                    "donors.analysis_service_request_id": [
                                                                                        "1282128"
                                                                                    ],
                                                                                    "boost": 0
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
                                                    "should": [
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
                                                                                            "range": {
                                                                                                "donors.qd": {
                                                                                                    "boost": 0,
                                                                                                    "gte": 3
                                                                                                }
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "terms": {
                                                                                                "donors.patient_id": [
                                                                                                    "1282129"
                                                                                                ],
                                                                                                "boost": 0
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "terms": {
                                                                                                "donors.analysis_service_request_id": [
                                                                                                    "1282128"
                                                                                                ],
                                                                                                "boost": 0
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
                                                                                    "must_not": [
                                                                                        {
                                                                                            "exists": {
                                                                                                "field": "donors.qd",
                                                                                                "boost": 0
                                                                                            }
                                                                                        }
                                                                                    ],
                                                                                    "must": [
                                                                                        {
                                                                                            "terms": {
                                                                                                "donors.patient_id": [
                                                                                                    "1282129"
                                                                                                ],
                                                                                                "boost": 0
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "terms": {
                                                                                                "donors.analysis_service_request_id": [
                                                                                                    "1282128"
                                                                                                ],
                                                                                                "boost": 0
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
                                            },
                                            {
                                                "bool": {
                                                    "should": [
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
                                                                                            "range": {
                                                                                                "donors.ad_ratio": {
                                                                                                    "boost": 0,
                                                                                                    "lte": 0.2
                                                                                                }
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "terms": {
                                                                                                "donors.patient_id": [
                                                                                                    "1282129"
                                                                                                ],
                                                                                                "boost": 0
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "terms": {
                                                                                                "donors.analysis_service_request_id": [
                                                                                                    "1282128"
                                                                                                ],
                                                                                                "boost": 0
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
                                                                                    "must_not": [
                                                                                        {
                                                                                            "exists": {
                                                                                                "field": "donors.ad_ratio",
                                                                                                "boost": 0
                                                                                            }
                                                                                        }
                                                                                    ],
                                                                                    "must": [
                                                                                        {
                                                                                            "terms": {
                                                                                                "donors.patient_id": [
                                                                                                    "1282129"
                                                                                                ],
                                                                                                "boost": 0
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "terms": {
                                                                                                "donors.analysis_service_request_id": [
                                                                                                    "1282128"
                                                                                                ],
                                                                                                "boost": 0
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
                                                                    "range": {
                                                                        "donors.ad_alt": {
                                                                            "boost": 0,
                                                                            "lt": 5
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    "terms": {
                                                                        "donors.patient_id": [
                                                                            "1282129"
                                                                        ],
                                                                        "boost": 0
                                                                    }
                                                                },
                                                                {
                                                                    "terms": {
                                                                        "donors.analysis_service_request_id": [
                                                                            "1282128"
                                                                        ],
                                                                        "boost": 0
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
                                                            "must_not": [
                                                                {
                                                                    "exists": {
                                                                        "field": "donors.ad_alt",
                                                                        "boost": 0
                                                                    }
                                                                }
                                                            ],
                                                            "must": [
                                                                {
                                                                    "terms": {
                                                                        "donors.patient_id": [
                                                                            "1282129"
                                                                        ],
                                                                        "boost": 0
                                                                    }
                                                                },
                                                                {
                                                                    "terms": {
                                                                        "donors.analysis_service_request_id": [
                                                                            "1282128"
                                                                        ],
                                                                        "boost": 0
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
                                                "bool": {
                                                    "should": [
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
                                                                                            "range": {
                                                                                                "donors.ad_total": {
                                                                                                    "boost": 0,
                                                                                                    "gte": 5
                                                                                                }
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "terms": {
                                                                                                "donors.patient_id": [
                                                                                                    "1282129"
                                                                                                ],
                                                                                                "boost": 0
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "terms": {
                                                                                                "donors.analysis_service_request_id": [
                                                                                                    "1282128"
                                                                                                ],
                                                                                                "boost": 0
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
                                                                                    "must_not": [
                                                                                        {
                                                                                            "exists": {
                                                                                                "field": "donors.ad_total",
                                                                                                "boost": 0
                                                                                            }
                                                                                        }
                                                                                    ],
                                                                                    "must": [
                                                                                        {
                                                                                            "terms": {
                                                                                                "donors.patient_id": [
                                                                                                    "1282129"
                                                                                                ],
                                                                                                "boost": 0
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "terms": {
                                                                                                "donors.analysis_service_request_id": [
                                                                                                    "1282128"
                                                                                                ],
                                                                                                "boost": 0
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
                                        ]
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
        }
        optimiseBooleanQuery(initialQuery)

        let nestedDonorsCount = addInnerHitsDonorsPath(initialQuery)
        const expectedResult = {}

        expect(nestedDonorsCount).to.eql(1)
    });
})