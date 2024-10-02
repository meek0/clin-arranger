import {expect} from "chai";
import sinon from "sinon";
import usersApiClient from '../services/usersApiClient.js';
import {handleRequest} from "../app/middlewares/flagsFilterMiddleware.js";

describe("handleRequest", () => {

    it(`Should handle a flags request for Variants index as SNV`, async () => {
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
                },
                {
                    "content": {
                        "field": "donors.analysis_service_request_id",
                        "value": [
                            "SR01"
                        ]
                    },
                },
                {
                    "content": {
                        "field": "donors.patient_id",
                        "value": [
                            "P01"
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
                            'hash1', 'hash2'
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
                },
                {
                    "content": {
                        "field": "donors.analysis_service_request_id",
                        "value": [
                            "SR01"
                        ]
                    },
                },
                {
                    "content": {
                        "field": "donors.patient_id",
                        "value": [
                            "P01"
                        ]
                    },
                }
                ],
            }
        }

        sinon.restore();
        sinon.stub(usersApiClient, 'getVariantsByFlags').callsFake(async function (_, flags, uniqueId) {
            expect(uniqueId).to.eql('SR01_P01_snv');
            if (flags.includes('foo')) return ['hash1_snv', 'hash2_snv', 'hash4_cnv'];
            else if (flags.includes('bar')) return ['hash3_snv'];
            else fail('unexpected flags: ' + flags);
        })

        const req = {body: {query: 'Variant', variables: variables}}

        await handleRequest(req)
        expect(req.body.variables).to.eql(expected);
    });
    it(`Should handle a flags request for Variants index as CNV`, async () => {
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
                        "field": "analysis_service_request_id",
                        "value": [
                            "SR02"
                        ]
                    },
                },
                {
                    "content": {
                        "field": "patient_id",
                        "value": [
                            "P02"
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
                            'hash1', 'hash2'
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
                        "field": "analysis_service_request_id",
                        "value": [
                            "SR02"
                        ]
                    },
                },
                {
                    "content": {
                        "field": "patient_id",
                        "value": [
                            "P02"
                        ]
                    },
                }
                ],
            }
        }

        sinon.restore();
        sinon.stub(usersApiClient, 'getVariantsByFlags').callsFake(async function (_, flags, uniqueId) {
            expect(uniqueId).to.eql('SR02_P02_snv');
            if (flags.includes('foo')) return ['hash1_snv', 'hash2_snv', 'hash4_cnv'];
            else if (flags.includes('bar')) return ['hash3_snv'];
            else fail('unexpected flags: ' + flags);
        })

        const req = {body: {query: 'Variant', variables: variables}}

        await handleRequest(req)
        expect(req.body.variables).to.eql(expected);
    });
    it(`Should handle a flags request for Variants without uniqueId`, async () => {
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
                            'hash1', 'hash2'
                        ]
                    },
                }
                ],
            }
        }

        sinon.restore();
        sinon.stub(usersApiClient, 'getVariantsByFlags').callsFake(async function (_, flags, uniqueId) {
            expect(uniqueId).to.eql('');
            if (flags.includes('foo')) return ['hash1_snv', 'hash2_snv', 'hash4_cnv'];
            else if (flags.includes('bar')) return ['hash3_snv'];
            else fail('unexpected flags: ' + flags);
        })

        const req = {body: {query: 'Variant', variables: variables}}

        await handleRequest(req)
        expect(req.body.variables).to.eql(expected);
    });
});