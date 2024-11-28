import { expect } from "chai"
import _ from 'lodash'
import { optimizeBooleanQuery, addInnerHitsDonorsPath } from "../app/middlewares/beforeES/nestedDonors.js"

describe("Optimize Query Tests", () => {
    it(`Should optimize request Q4`, () => {
  
        const q4 = {
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
                                        }
                                    ]
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

        let optimizedQuery = q4
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

