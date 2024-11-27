import { expect } from "chai"
import _ from 'lodash'
import { optimizeBooleanQuery, addInnerHitsDonorsPath } from "../app/middlewares/beforeES/nestedDonors.js"

describe("Optimize Query Tests", () => {
    it(`Should optimize request Q9`, () => {

        const q9 = {
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
        
        const output = {
            "bool": {
                "must_not": [],
                "must": [
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
                                                ],
                                                "should": [
                                                    {
                                                        "range": {
                                                            "donors.gq": {
                                                                "boost": 0,
                                                                "gte": 200
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "bool": {
                                                            "must_not": [
                                                                {
                                                                    "exists": {
                                                                        "field": "donors.gq",
                                                                        "boost": 0
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "range": {
                                                            "donors.ad_alt": {
                                                                "boost": 0,
                                                                "gte": 500
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "bool": {
                                                            "must_not": [
                                                                {
                                                                    "exists": {
                                                                        "field": "donors.ad_alt",
                                                                        "boost": 0
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    },
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
                                                            "donors.filters": [
                                                                "long_indel"
                                                            ],
                                                            "boost": 0
                                                        }
                                                    },
                                                    {
                                                        "bool": {
                                                            "must": [
                                                                {
                                                                    "bool": {
                                                                        "should": [
                                                                            {
                                                                                "range": {
                                                                                    "donors.gq": {
                                                                                        "boost": 0,
                                                                                        "lt": 20
                                                                                    }
                                                                                }
                                                                            },
                                                                            {
                                                                                "bool": {
                                                                                    "must_not": [
                                                                                        {
                                                                                            "exists": {
                                                                                                "field": "donors.gq",
                                                                                                "boost": 0
                                                                                            }
                                                                                        }
                                                                                    ]
                                                                                }
                                                                            }
                                                                        ],
                                                                        "minimum_should_match": 1
                                                                    }
                                                                },
                                                                {
                                                                    "terms": {
                                                                        "donors.transmission": [
                                                                            "autosomal_dominant_de_novo"
                                                                        ],
                                                                        "boost": 0
                                                                    }
                                                                },
                                                                {
                                                                    "bool": {
                                                                        "should": [
                                                                            {
                                                                                "range": {
                                                                                    "donors.qd": {
                                                                                        "boost": 0,
                                                                                        "gte": 3
                                                                                    }
                                                                                }
                                                                            },
                                                                            {
                                                                                "bool": {
                                                                                    "must_not": [
                                                                                        {
                                                                                            "exists": {
                                                                                                "field": "donors.qd",
                                                                                                "boost": 0
                                                                                            }
                                                                                        }
                                                                                    ]
                                                                                }
                                                                            }
                                                                        ],
                                                                        "minimum_should_match": 1
                                                                    }
                                                                },
                                                                {
                                                                    "bool": {
                                                                        "should": [
                                                                            {
                                                                                "range": {
                                                                                    "donors.ad_ratio": {
                                                                                        "boost": 0,
                                                                                        "lte": 0.2
                                                                                    }
                                                                                }
                                                                            },
                                                                            {
                                                                                "bool": {
                                                                                    "must_not": [
                                                                                        {
                                                                                            "exists": {
                                                                                                "field": "donors.ad_ratio",
                                                                                                "boost": 0
                                                                                            }
                                                                                        }
                                                                                    ]
                                                                                }
                                                                            }
                                                                        ],
                                                                        "minimum_should_match": 1
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "range": {
                                                            "donors.ad_alt": {
                                                                "boost": 0,
                                                                "lt": 5
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "bool": {
                                                            "must_not": [
                                                                {
                                                                    "exists": {
                                                                        "field": "donors.ad_alt",
                                                                        "boost": 0
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "bool": {
                                                            "should": [
                                                                {
                                                                    "range": {
                                                                        "donors.ad_total": {
                                                                            "boost": 0,
                                                                            "gte": 5
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    "bool": {
                                                                        "must_not": [
                                                                            {
                                                                                "exists": {
                                                                                    "field": "donors.ad_total",
                                                                                    "boost": 0
                                                                                }
                                                                            }
                                                                        ]
                                                                    }
                                                                }
                                                            ],
                                                            "minimum_should_match": 1
                                                        }
                                                    }
                                                ],
                                                "minimum_should_match": 1
                                            }
                                        },
                                        "inner_hits": {
                                            "_source": [
                                                "donors.*"
                                            ]
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }

        let optimizedQuery = q9
        let counter = 0
        let nestedDonorsCount = addInnerHitsDonorsPath(optimizedQuery)

        while(nestedDonorsCount > 1 && counter < 10){
            optimizedQuery = optimizeBooleanQuery(optimizedQuery)
            nestedDonorsCount = addInnerHitsDonorsPath(optimizedQuery)
            counter++
        }

        expect(optimizedQuery).to.eql(output);
    });
});

