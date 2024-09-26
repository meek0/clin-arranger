import {expect} from "chai";
import {extractFlagsAndIndexFromRequest, replaceSqonFlagsWithHash} from "../app/middlewares/flagsFilterMiddleware.js";

describe("extractFlagsAndIndexFromRequest", () => {
    it(`Should extract flags and detect index for SNV request`, () => {
        const variables = {
            "sqon": {
                "content": [
                    {
                        "content": {
                            "field": "flags",
                            "value": [
                                "flag1",
                                "flag2"
                            ]
                        },
                        "op": "all"
                    }
                ],
                "op": "and",
                "pivot": "donors"
            }
        }
        const {flags, index} = extractFlagsAndIndexFromRequest({body: {query: 'Variants', variables: variables}})
        expect(flags).to.eql(['flag1', 'flag2']);
        expect(index).to.eql('snv');
    });
    it(`Should return empty flags and detect index for CNV request`, () => {
        const variables = {
            "sqon": {
                "content": [
                    {
                        "content": {
                            "field": "foo",
                            "value": 'bar'
                        },
                        "op": "all"
                    }
                ],
                "op": "and",
                "pivot": "donors"
            }
        }
        const {flags, index} = extractFlagsAndIndexFromRequest({body: {query: 'Cnv', variables: variables}})
        expect(flags).to.eql([]);
        expect(index).to.eql('cnv');
    });
    it(`Should return empty flags and null index if not supported`, () => {
        const {flags, index} = extractFlagsAndIndexFromRequest({body: {query: 'foo'}})
        expect(flags).to.eql([]);
        expect(index).to.eql(null);
    });
});


describe("replaceSqonFlagsWithHash", () => {
    it(`Should replace sqon flags with expected hash`, () => {
        const variables = {
            "sqon": {
                "content": [
                    {
                        "content": {
                            "field": "flags",
                            "value": [
                                "flag1",
                                "flag2"
                            ]
                        },
                        "op": "all"
                    }
                ],
                "op": "and",
                "pivot": "donors"
            }
        }
        const expected = {
            "sqon": {
                "content": [
                    {
                        "content": {
                            "field": "hash",
                            "value": [
                                "hash1",
                                "hash2",
                                "hash3"
                            ]
                        },
                        "op": "all"
                    }
                ],
                "op": "and",
                "pivot": "donors"
            }
        }
        replaceSqonFlagsWithHash(variables.sqon, ['hash1', 'hash2', 'hash3']);
        expect(variables).to.eql(expected);
    });
});