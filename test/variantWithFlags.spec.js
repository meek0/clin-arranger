import { expect } from "chai";
import { mapVariantToUniqueId, mapVariantPropertiesToVariants } from '../services/variantPropertiesUtils.js';

const cnvBody = {
    data:{
        Variants: {
            hits: {
                edges: [
                    {
                        node: {
                            hash: "3bbdfd2a87aa27b708420347et6a09063630fa9d",
                            patient_id: "P00001",
                        }
                    }
                ]
            }
        }
    }
};

const snvBody = {
    data:{
        Variants: {
            hits: {
                edges: [
                    {
                        node: {
                            hash: "3bbdfd2a87aa27b708420347et6a09063630fa9d",
                            locus: "10-101338156-T-K",
                        }
                    }
                ]
            }
        }
    }
};

const variantProperties = [
    {
        id: 2,
        unique_id: "10-101338156-T-K_snv",
        author_id: "US0001",
        organization_id: "LDM-CHUSJ",
        timestamp: new Date("2024-07-10T16:28:35.193Z"),
        properties: {
            flags: [
                "flag1"
            ]
        }
    },
    {
        id: 6,
        unique_id: "10-101338156-T-K_snv",
        author_id: "US0001",
        organization_id: "LDM-CHUSJ",
        timestamp: new Date("2024-07-16T10:30:53.638Z"),
        properties: {
            flags: [
                "flag1",
                "flag2"
            ]
        }
    },
];

describe("mapVariantToUniqueId", () => {
    it("should map SNV to correct unique_id", () => {
        expect(mapVariantToUniqueId(snvBody.data.Variants.hits.edges[0])).to.eql("10-101338156-T-K_snv");
    });
    it("should map CNV to correct unique_id", () => {
        expect(mapVariantToUniqueId(cnvBody.data.Variants.hits.edges[0])).to.eql("3bbdfd2a87aa27b708420347et6a09063630fa9d_cnv");
    });
    it("should be robust", () => {
        expect(mapVariantToUniqueId(null)).to.eql(null);
        expect(mapVariantToUniqueId({})).to.eql(null);
        expect(mapVariantToUniqueId([])).to.eql(null);
    });
});

describe("mapVariantPropertiesToVariants", () => {
    const expected = [
        {
            node: {
                hash: "3bbdfd2a87aa27b708420347et6a09063630fa9d",
                locus: "10-101338156-T-K",
                flags: [
                    "flag1",
                    "flag2",
                ]
            }
        }
    ];

    it("should add latest variant properties flag to variant", () => {
        expect(mapVariantPropertiesToVariants(snvBody.data.Variants.hits.edges, variantProperties)).to.eql(expected);
    });
});
