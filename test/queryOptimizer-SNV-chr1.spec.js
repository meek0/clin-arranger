import { expect } from "chai"
import _ from 'lodash'
import { optimizeBooleanQuery, addInnerHitsDonorsPath } from "../app/middlewares/beforeES/nestedDonors.js"

describe("Optimize Query Tests", () => {
    it(`Should optimize request SNV + chr1`, () => {

        const input = {
            "bool": {
                "must": [
                    {
                        "bool": {
                            "must": [
                                {
                                    "terms": {
                                        "chromosome": [
                                            "1"
                                        ],
                                        "boost": 0
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
                                                                "1282322"
                                                            ],
                                                            "boost": 0
                                                        }
                                                    },
                                                    {
                                                        "terms": {
                                                            "donors.analysis_service_request_id": [
                                                                "1285494"
                                                            ],
                                                            "boost": 0
                                                        }
                                                    },
                                                    {
                                                        "terms": {
                                                            "donors.bioinfo_analysis_code": [
                                                                "TEBA"
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
                                    "terms": {
                                        "variant_class": [
                                            "SNV"
                                        ],
                                        "boost": 0
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
                                                                "1282322"
                                                            ],
                                                            "boost": 0
                                                        }
                                                    },
                                                    {
                                                        "terms": {
                                                            "donors.analysis_service_request_id": [
                                                                "1285494"
                                                            ],
                                                            "boost": 0
                                                        }
                                                    },
                                                    {
                                                        "terms": {
                                                            "donors.bioinfo_analysis_code": [
                                                                "TEBA"
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
                                                "must": [
                                                    {
                                                        "terms": {
                                                            "consequences.biotype": [
                                                                "lncRNA"
                                                            ],
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
                                                                "1282322"
                                                            ],
                                                            "boost": 0
                                                        }
                                                    },
                                                    {
                                                        "terms": {
                                                            "donors.analysis_service_request_id": [
                                                                "1285494"
                                                            ],
                                                            "boost": 0
                                                        }
                                                    },
                                                    {
                                                        "terms": {
                                                            "donors.bioinfo_analysis_code": [
                                                                "TEBA"
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
                                                    "1282322"
                                                ],
                                                "boost": 0
                                            }
                                        },
                                        {
                                            "terms": {
                                                "donors.analysis_service_request_id": [
                                                    "1285494"
                                                ],
                                                "boost": 0
                                            }
                                        },
                                        {
                                            "terms": {
                                                "donors.bioinfo_analysis_code": [
                                                    "TEBA"
                                                ],
                                                "boost": 0
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
                        "terms": {
                            "chromosome": [
                                "1"
                            ],
                            "boost": 0
                        }
                    },
                    {
                        "terms": {
                            "variant_class": [
                                "SNV"
                            ],
                            "boost": 0
                        }
                    },
                    {
                        "nested": {
                            "path": "consequences",
                            "query": {
                                "bool": {
                                    "must": [
                                        {
                                            "terms": {
                                                "consequences.biotype": [
                                                    "lncRNA"
                                                ],
                                                "boost": 0
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                ],
                "must_not": []
            }
        }

        let optimizedQuery = input
        let counter = 0
        let nestedDonorsCount = addInnerHitsDonorsPath(optimizedQuery)

        while (nestedDonorsCount > 1 && counter < 10) {
            optimizedQuery = optimizeBooleanQuery(optimizedQuery)
            nestedDonorsCount = addInnerHitsDonorsPath(optimizedQuery)
            counter++
        }

        expect(optimizedQuery).to.eql(output);
    });
});
