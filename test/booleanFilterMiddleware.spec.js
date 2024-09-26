import {expect} from "chai";
import booleanFilterMiddleware from "../app/middlewares/booleanFilterMiddleware.js";

describe("explode boolean multivalues query", () => {
    it(`Should clean query`, () => {
        const initialQuery = {
            "sqon": {
                "content": [
                    {
                        "content": {
                            "field": "donors.is_hc",
                            "index": "Variants",
                            "value": [
                                "false",
                                "true"
                            ]
                        },
                        "op": "all"
                    }
                ],
                "op": "and",
                "pivot": "donors"
            }
        }
        booleanFilterMiddleware({body: {variables: initialQuery}}, null, () => {
        })
        const expectedResult = {"sqon":{"content":[{"content":[{"content":{"field":"donors.is_hc","index":"Variants","value":["true"]},"op":"in"},{"content":{"field":"donors.is_hc","index":"Variants","value":["false"]},"op":"in"}],"op":"and"}],"op":"and","pivot":"donors"}}

        expect(JSON.stringify(initialQuery)).to.eql(JSON.stringify(expectedResult))
    });

    it("shouldn't clean IN query", () => {
        let initialQuery, expectedQuery
        initialQuery = expectedQuery = {
            "sqon": {
                "content": [
                    {
                        "content": {
                            "field": "donors.is_hc",
                            "index": "Variants",
                            "value": [
                                "false",
                                "true"
                            ]
                        },
                        "op": "in"
                    }
                ],
                "op": "and",
                "pivot": "donors"
            }
        }
        booleanFilterMiddleware({body: {variables: initialQuery}}, null, () => {
        })

        expect(JSON.stringify(initialQuery)).to.eql(JSON.stringify(expectedQuery))
    })

    it('should explode this query', () => {
        const initialQuery = {
            sqon: {
                "content": [{
                    "content": [{
                        "content": {"field": "donors.patient_id", "value": ["439844"]},
                        "op": "in"
                    }], "op": "and"
                }, {
                    "content": [{
                        "content": {
                            "field": "donors.is_possibly_hc",
                            "index": "Variants",
                            "value": ["false", "true"]
                        }, "op": "all"
                    }], "op": "and", "pivot": "donors"
                }], "op": "and", "pivot": "donors"
            }
        }

        const expectedQuery = {
            "sqon": {
                "content": [
                    {
                        "content": [
                            {
                                "content": {
                                    "field": "donors.patient_id",
                                    "value": [
                                        "439844"
                                    ]
                                },
                                "op": "in"
                            }
                        ],
                        "op": "and"
                    },
                    {
                        "content": [
                            {
                                "content": [
                                    {
                                        "content": {
                                            "field": "donors.is_possibly_hc",
                                            "index": "Variants",
                                            "value": [
                                                "true"
                                            ]
                                        },
                                        "op": "in"
                                    },
                                    {
                                        "content": {
                                            "field": "donors.is_possibly_hc",
                                            "index": "Variants",
                                            "value": [
                                                "false"
                                            ]
                                        },
                                        "op": "in"
                                    }
                                ],
                                "op": "and"
                            }
                        ],
                        "op": "and",
                        "pivot": "donors"
                    }
                ],
                "op": "and",
                "pivot": "donors"
            }
        }
        booleanFilterMiddleware({body: {variables: initialQuery}}, null, () => {
        })
        expect(JSON.stringify(initialQuery)).to.eql(JSON.stringify(expectedQuery))

    })
});