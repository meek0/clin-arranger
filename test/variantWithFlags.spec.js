import { expect } from "chai";
import { mapHitToUniqueId, mapVariantPropertiesToHits } from '../services/variantPropertiesUtils.js';

const hits = {
    total: {
        value: 10000,
    },
    hits: [
        {
            _source: {
                "hash": "3bbdfd2a87aa27b708420347et6a09063630fa9d",
                "locus": "10-101338156-T-K",
                "variant_class": "SNV",
            }
        }
    ]
};

const variantProperties = [
    {
        "id": 2,
        "unique_id": "10-101338156-T-K_snv",
        "author_id": "US0001",
        "organization_id": "LDM-CHUSJ",
        "timestamp": new Date("2024-07-10T16:28:35.193Z"),
        "properties": {
            "flags": [
                "flag1"
            ]
        }
    },
    {
        "id": 6,
        "unique_id": "10-101338156-T-K_snv",
        "author_id": "US0001",
        "organization_id": "LDM-CHUSJ",
        "timestamp": new Date("2024-07-16T10:30:53.638Z"),
        "properties": {
            "flags": [
                "flag1",
                "flag2"
            ]
        }
    },
];

describe("mapHitToUniqueId", () => {
    it("should map to correct unique_id", () => {
        expect(mapHitToUniqueId(hits.hits[0])).to.eql("10-101338156-T-K_snv");
    });
});

describe("mapVariantPropertiesToHits", () => {
    const expected = [
        {
            _source: {
                "hash": "3bbdfd2a87aa27b708420347et6a09063630fa9d",
                "locus": "10-101338156-T-K",
                "variant_class": "SNV",
                "flags": [
                    "flag1",
                    "flag2",
                ]
            }
        }
    ];

    it("should add latest variant properties flag to hit", () => {
        expect(mapVariantPropertiesToHits(hits.hits, variantProperties)).to.eql(expected);
    });
});