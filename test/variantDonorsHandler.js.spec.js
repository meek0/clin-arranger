import { expect } from "chai";
import { cleanupDonors } from "../app/controllers/variantDonorsHandler.js";

describe("cleanupDonors", () => {

  const data = {
    data: {
      Variants: {
        hits: {
          edges: [
            {
              node: {
                id: "variant1",
                consequences: [],
                donors: {
                  hits: {
                    total: 3,
                    edges: [
                      {
                        node: { patient_id: 0, analysis_service_request_id: "B", bioinfo_analysis_code: "TEBA" },
                      },
                      {
                        node: { patient_id: 1, analysis_service_request_id: "A", bioinfo_analysis_code: "TNEBA" },
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
                        node: { patient_id: 0},
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    },
  };

  it(`Should cleanup donors by patientIds`, () => {
    const expected = {
      data: {
        Variants: {
          hits: {
            edges: [
              {
                node: {
                  id: "variant1",
                  consequences: [],
                  donors: {
                    hits: {
                      total: 2,
                      edges: [
                        {
                          node: { patient_id: 0, analysis_service_request_id: "B", bioinfo_analysis_code: "TEBA" },
                        },
                        {
                          node: { patient_id: 1, analysis_service_request_id: "A", bioinfo_analysis_code: "TNEBA" },
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
            ],
          },
        },
      },
    };
    expect(cleanupDonors(JSON.stringify(data), ["0", "1"], [])).to.eql(
      JSON.stringify(expected)
    );
  });

  it(`Should cleanup donors by patientIds and analysisId (if available)`, () => {
    const expected = {
      data: {
        Variants: {
          hits: {
            edges: [
              {
                node: {
                  id: "variant1",
                  consequences: [],
                  donors: {
                    hits: {
                      total: 2,
                      edges: [
                        {
                          node: { patient_id: 0, analysis_service_request_id: "B", bioinfo_analysis_code: "TEBA" },
                        },
                        {
                          node: { patient_id: 1, analysis_service_request_id: "A", bioinfo_analysis_code: "TNEBA" },
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
            ],
          },
        },
      },
    };
    expect(cleanupDonors(JSON.stringify(data), ["0", "1"], ["A", "B"])).to.eql(
      JSON.stringify(expected)
    );
  });

  it(`Should cleanup donors by patientIds and analysisId and bioinfo analysis code (if available)`, () => {
    const expected = {
      data: {
        Variants: {
          hits: {
            edges: [
              {
                node: {
                  id: "variant1",
                  consequences: [],
                  donors: {
                    hits: {
                      total: 1,
                      edges: [
                        {
                          node: { patient_id: 0, analysis_service_request_id: "B", bioinfo_analysis_code: "TEBA" },
                        }
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
            ],
          },
        },
      },
    };
    expect(cleanupDonors(JSON.stringify(data), ["0", "1"], ["A", "B"], ["TEBA"])).to.eql(
      JSON.stringify(expected)
    );
  });
});
