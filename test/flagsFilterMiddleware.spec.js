import {expect} from "chai";
import {handleRequest} from "../app/middlewares/flagsFilterMiddleware.js";

describe("handleRequest", () => {

    it(`Should handle a flags request for Variants index as snv and ignore cnv`, async () => {
        const variables = {
            "sqon": {
                "content": [
                {
                    "content": {
                        "field": "flags",
                        "value": [
                            "foo",
                            "__missing__"
                        ]
                    },
                },
                {
                    "content": [
                        {
                            "content": {
                                "field": "flags",
                                "value": [
                                    "bar"
                                ]
                            },
                        },
                    ],
                },
                {
                    "content": {
                        "field": "donors.bioinfo_analysis_code",
                        "value": [
                            "TEBA"
                        ]
                    },
                }
                ],
            }
        }
        const expected = {
            "sqon": {
                "content": [
                {
                    "content": {
                        "field": "hash",
                        "value": [
                            'hash1', 'hash2', '__missing__'
                        ]
                    },
                },
                {
                    "content": [
                        {
                            "content": {
                                "field": "hash",
                                "value": [
                                    'hash3'
                                ]
                            },
                        },
                    ],
                },
                {
                    "content": {
                        "field": "donors.bioinfo_analysis_code",
                        "value": [
                            "TEBA"
                        ]
                    },
                }
                ],
            }
        }

        function fetchFunction (_, ids) {
            if (ids.includes('foo')) return ['hash1_snv', 'hash2_snv', 'hash4_cnv'];
            else if (ids.includes('bar')) return ['hash3_snv'];
            else fail('unexpected ids: ' + ids);
        }

        const req = {body: {query: 'Variant', variables: variables}}

        await handleRequest(req, fetchFunction)
        expect(req.body.variables).to.eql(expected);
    });
});