import { expect } from "chai";
import nestedDonors from "../app/middlewares/beforeES/nestedDonors.js";

describe("nestedDonors", () => {
  it(`Should split query if donors are present`, () => {
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
        "query": {
            "bool": {
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
                                                                "508428"
                                                            ],
                                                            "boost": 0
                                                        }
                                                    },
                                                    {
                                                        "terms": {
                                                            "donors.analysis_service_request_id": [
                                                                "508427"
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
        },
        "_source": {
            "includes": [
                "hash"
            ],
            "excludes": [
                "*"
            ]
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
});
