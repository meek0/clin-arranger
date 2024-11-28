import { expect } from "chai";
import variantDonors from "../app/middlewares/afterES/variantDonors.js";

describe("variantDonors", () => {
  it(`Should extract inner_hits of donors`, async () => {
    const hits ={
        total: {
            value: 10000,
        },
        hits: [
            {
                _source: {
                    variant_type: [
                        "germline"
                    ],
                    locus_id_1: "11-72583396-G-A",
                    hash: "849b437a6855bade94689c61539e5ee03b418478"
                },
                inner_hits: {
                    donors: {
                        hits: {
                            hits: [
                                {
                                    _source: {
                                        batch_id: "201106_A00516_0169_AHFM3HDSXY",
                                        variant_type: "germline",
                                        analysis_service_request_id: "508427",
                                        patient_id: "508428",
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        ]
    };

    const expected = {
        total: {
            value: 10000,
        },
        hits: [
            {
                _source: {
                    variant_type: [
                        "germline"
                    ],
                    locus_id_1: "11-72583396-G-A",
                    hash: "849b437a6855bade94689c61539e5ee03b418478",
                    donors: [
                        {
                            batch_id: "201106_A00516_0169_AHFM3HDSXY",
                            variant_type: "germline",
                            analysis_service_request_id: "508427",
                            patient_id: "508428",
                        }
                    ]
                },
            }
        ]
    };
       
    expect(await variantDonors(null, hits)).to.eql(expected)
  });

  it(`Should do nothing if no inner_hits`, async () => {
    const hits ={
        total: {
            value: 10000,
        },
        hits: [
            {
                _source: {
                    variant_type: [
                        "germline"
                    ],
                    locus_id_1: "11-72583396-G-A",
                    hash: "849b437a6855bade94689c61539e5ee03b418478"
                },
            }
        ]
    };
    expect(await variantDonors(null, hits)).to.eql(hits)
  });

  it(`Should ignore and delete inner_hits if donors already exist`, async () => {
    const hits ={
        total: {
            value: 10000,
        },
        hits: [
            {
                _source: {
                    variant_type: [
                        "germline"
                    ],
                    locus_id_1: "11-72583396-G-A",
                    hash: "849b437a6855bade94689c61539e5ee03b418478",
                    donors: [
                        {
                            batch_id: "batch1",
                            variant_type: "germline",
                            analysis_service_request_id: "barrr",
                            patient_id: "fooo",
                        }
                    ]
                },
                inner_hits: {
                    donors: {
                        hits: {
                            hits: [
                                {
                                    _source: {
                                        batch_id: "201106_A00516_0169_AHFM3HDSXY",
                                        variant_type: "germline",
                                        analysis_service_request_id: "508427",
                                        patient_id: "508428",
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        ]
    };

    const expected = {
        total: {
            value: 10000,
        },
        hits: [
            {
                _source: {
                    variant_type: [
                        "germline"
                    ],
                    locus_id_1: "11-72583396-G-A",
                    hash: "849b437a6855bade94689c61539e5ee03b418478",
                    donors: [
                        {
                            batch_id: "batch1",
                            variant_type: "germline",
                            analysis_service_request_id: "barrr",
                            patient_id: "fooo",
                        }
                    ]
                },
            }
        ]
    };
       
    expect(await variantDonors(null, hits)).to.eql(expected)
  });
});
