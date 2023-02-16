import { expect } from "chai";
import { cleanupDonors } from "../app/controllers/variantDonorsHandler.js";

describe("cleanupDonors", () => {
  it(`Should cleanup donors`, () => {
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
                          node: { patient_id: 0 },
                        },
                        {
                          node: { patient_id: 1 },
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
            ],
          },
        },
      },
    };
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
                          node: { patient_id: 0 },
                        },
                        {
                          node: { patient_id: 1 },
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
    expect(cleanupDonors(JSON.stringify(data), ["0", "1"])).to.eql(
      JSON.stringify(expected)
    );
  });
});
