import {expect} from "chai";
import booleanFilterMiddleware from "../app/middlewares/booleanFilterMiddleware.js";
import sinon from 'sinon'

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
        booleanFilterMiddleware({body: {variables: initialQuery}}, null, sinon.spy())
        const expectedResult = {
            sqon: {
                "content": [
                    {
                        "content": {
                            "field": "donors.is_hc",
                            "index": "Variants",
                            "value": [
                                "true"
                            ]
                        },
                        "op": "in"
                    },
                    {
                        "content": {
                            "field": "donors.is_hc",
                            "index": "Variants",
                            "value": [
                                "false"
                            ]
                        },
                        "op": "in"
                    }
                ],
                "op": "and",
                "pivot": "donors"
            }
        }

        expect(JSON.stringify(initialQuery)).to.eql(JSON.stringify(expectedResult))
    });

    it("shouldn't clean IN query", () => {
        let initialQuery, expectedQuery
        initialQuery = expectedQuery =  {
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
        booleanFilterMiddleware({body: {variables: initialQuery}}, null, sinon.spy())

        expect(JSON.stringify(initialQuery)).to.eql(JSON.stringify(expectedQuery))
    })
});