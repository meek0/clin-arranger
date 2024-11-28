import { expect } from "chai"
import _ from 'lodash'
import { optimizeBooleanQuery, addInnerHitsDonorsPath } from "../app/middlewares/beforeES/nestedDonors.js"

describe("Optimize Query Tests", () => {
    it(`Should optimize request with mix nested`, () => {

        const input = {
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
                                                    "path": "consequences",
                                                    "query": {
                                                        "bool": {
                                                            "must": [
                                                                {
                                                                    "range": {
                                                                        "consequences.predictions.dann_score": {
                                                                            "boost": 0,
                                                                            "lt": 0.05
                                                                        }
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
                                                    "path": "consequences",
                                                    "query": {
                                                        "bool": {
                                                            "must_not": [
                                                                {
                                                                    "exists": {
                                                                        "field": "consequences.predictions.dann_score",
                                                                        "boost": 0
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
                                            "bool": {
                                                "should": []
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
                    },
                    {
                        "nested": {
                            "path": "consequences",
                            "query": {
                                "bool": {
                                    "must": [
                                        {
                                            "range": {
                                                "consequences.predictions.dann_score": {
                                                    "boost": 0,
                                                    "lt": 0.05
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    {
                        "nested": {
                            "path": "consequences",
                            "query": {
                                "bool": {
                                    "must_not": [
                                        {
                                            "exists": {
                                                "field": "consequences.predictions.dann_score",
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

        let optimizedQuery = input
        let counter = 0
        let nestedDonorsCount = addInnerHitsDonorsPath(optimizedQuery)

        while(nestedDonorsCount > 1 && counter < 1){
            optimizedQuery = optimizeBooleanQuery(optimizedQuery)
            nestedDonorsCount = addInnerHitsDonorsPath(optimizedQuery)
            counter++
        }

        expect(optimizedQuery).to.eql(output);
    });
});

