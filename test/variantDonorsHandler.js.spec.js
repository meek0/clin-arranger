import { expect } from "chai";
import { cleanupDonors } from "../app/controllers/beforeSendHandler.js";

describe("cleanupDonors", () => {
  const variants = [
    {
      node: {
        id: "variant1",
        consequences: [],
        donors: {
          hits: {
            total: 3,
            edges: [
              {
                node: {
                  patient_id: 0,
                  analysis_service_request_id: "B",
                  bioinfo_analysis_code: "TEBA",
                },
              },
              {
                node: {
                  patient_id: 1,
                  analysis_service_request_id: "A",
                  bioinfo_analysis_code: "TNEBA",
                },
              },
              {
                node: { patient_id: 2 },
              },
            ],
          },
        },
      },
    },
    {
      node: {
        id: "variant2",
        consequences: [],
        donors: {
          hits: {
            total: 1,
            edges: [
              {
                node: { patient_id: 3 },
              },
            ],
          },
        },
      },
    },
    {
      node: {
        id: "variant3",
        consequences: [],
        donors: {
          hits: {
            total: 1,
            edges: [
              {
                node: { patient_id: 0 },
              },
            ],
          },
        },
      },
    },
  ];

  it(`Should cleanup donors by patientIds`, async () => {
    const expected = [
      {
        node: {
          id: "variant1",
          consequences: [],
          donors: {
            hits: {
              total: 2,
              edges: [
                {
                  node: {
                    patient_id: 0,
                    analysis_service_request_id: "B",
                    bioinfo_analysis_code: "TEBA",
                  },
                },
                {
                  node: {
                    patient_id: 1,
                    analysis_service_request_id: "A",
                    bioinfo_analysis_code: "TNEBA",
                  },
                },
              ],
            },
          },
        },
      },
      {
        node: {
          id: "variant2",
          consequences: [],
          donors: {
            hits: {
              total: 0,
              edges: [],
            },
          },
        },
      },
      {
        node: {
          id: "variant3",
          consequences: [],
          donors: {
            hits: {
              total: 1,
              edges: [
                {
                  node: { patient_id: 0 },
                },
              ],
            },
          },
        },
      },
    ];
    await cleanupDonors(variants, ["0", "1"], [])
    expect(variants).to.eql(expected);
  });

  it(`Should cleanup donors by patientIds and analysisId (if available)`, async () => {
    const expected = [
      {
        node: {
          id: "variant1",
          consequences: [],
          donors: {
            hits: {
              total: 2,
              edges: [
                {
                  node: {
                    patient_id: 0,
                    analysis_service_request_id: "B",
                    bioinfo_analysis_code: "TEBA",
                  },
                },
                {
                  node: {
                    patient_id: 1,
                    analysis_service_request_id: "A",
                    bioinfo_analysis_code: "TNEBA",
                  },
                },
              ],
            },
          },
        },
      },
      {
        node: {
          id: "variant2",
          consequences: [],
          donors: {
            hits: {
              total: 0,
              edges: [],
            },
          },
        },
      },
      {
        node: {
          id: "variant3",
          consequences: [],
          donors: {
            hits: {
              total: 1,
              edges: [
                {
                  node: { patient_id: 0 },
                },
              ],
            },
          },
        },
      },
    ];
    await cleanupDonors(variants, ["0", "1"], ["A", "B"])
    expect(variants).to.eql(expected);
  });

  it(`Should cleanup donors by patientIds and analysisId and bioinfo analysis code (if available)`, async () => {
    const expected = [
      {
        node: {
          id: "variant1",
          consequences: [],
          donors: {
            hits: {
              total: 1,
              edges: [
                {
                  node: {
                    patient_id: 0,
                    analysis_service_request_id: "B",
                    bioinfo_analysis_code: "TEBA",
                  },
                },
              ],
            },
          },
        },
      },
      {
        node: {
          id: "variant2",
          consequences: [],
          donors: {
            hits: {
              total: 0,
              edges: [],
            },
          },
        },
      },
      {
        node: {
          id: "variant3",
          consequences: [],
          donors: {
            hits: {
              total: 1,
              edges: [
                {
                  node: { patient_id: 0 },
                },
              ],
            },
          },
        },
      },
    ];
    await cleanupDonors(variants, ["0", "1"], ["A", "B"], ["TEBA"])
    expect(variants).to.eql(
      expected
    );
  });
});
