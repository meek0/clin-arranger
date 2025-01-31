import { expect } from "chai";
import {
  extractPersonIds,
  maskPersons,
  removeFullyRestrictedNodes,
  updateTotal,
  getTotalAndIndexName,
} from "../app/controllers/maskPersonsHandler.js";

const data = [
  {
    node: {
      id: "1001",
      person: {
        id: "1",
        first_name: "Doe",
        last_name: "John",
        ramq: "1231",
      },
      sequencing_requests: {
        hits: {
          edges: [
            {
              node: {
                person: {
                  id: "2",
                  first_name: "Doe",
                  last_name: "John",
                  ramq: "1232",
                },
              },
            },
            {
              node: {
                person: {
                  id: "3",
                  first_name: "Doe",
                  last_name: "John",
                  ramq: "1233",
                },
              },
            },
          ],
        },
      },
    },
  },
  {
    node: {
      id: "1004",
      person: {
        id: "4",
        first_name: "Doe",
        last_name: "John",
        ramq: "1234",
      },
      sequencing_requests: {
        hits: {
          edges: [
            {
              node: {
                person: {
                  id: "5",
                  first_name: "Doe",
                  last_name: "John",
                  ramq: "1235",
                },
              },
            },
          ],
        },
      },
    },
  },
  {
    node: {
      id: "1006",
      person: {
        id: "6",
        first_name: "Doe",
        last_name: "John",
        ramq: "1236",
      },
    },
  },
];

const fhirPersons = [
  {
    resourceType: "Person",
    id: "1",
    identifier: [
      {
        type: {
          coding: [
            {
              code: "JHN",
            },
          ],
        },
        value: "1231",
      },
    ],
    name: [
      {
        family: "Doe",
        given: ["John"],
      },
    ],
  },
  {
    resourceType: "Person",
    id: "2",
    identifier: [
      {
        type: {
          coding: [
            {
              code: "JHN",
            },
          ],
        },
        value: "1232",
      },
    ],
    name: [
      {
        family: "Doe",
        given: ["John"],
      },
    ],
  },
  {
    resourceType: "Person",
    id: "3",
    identifier: [
      {
        type: {
          coding: [
            {
              code: "JHN",
            },
          ],
        },
        value: "1232",
      },
    ],
    name: [
      {
        family: "Doe",
        given: ["John"],
      },
    ],
  },
];

describe("extractPersonIds", () => {
  it(`Should extract person IDs`, () => {
    expect(extractPersonIds(data)).to.eql(["1", "2", "3", "4", "5", "6"]);
  });
});

describe("maskPersons", () => {
  it(`Should mask person infos`, () => {
    const expected = [
      {
        node: {
          id: "1001",
          person: {
            id: "1",
            first_name: "Doe",
            last_name: "John",
            ramq: "1231",
          },
          sequencing_requests: {
            hits: {
              edges: [
                {
                  node: {
                    person: {
                      id: "2",
                      first_name: "Doe",
                      last_name: "John",
                      ramq: "1232",
                    },
                  },
                },
                {
                  node: {
                    person: {
                      id: "3",
                      first_name: "Doe",
                      last_name: "John",
                      ramq: "1233",
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        node: {
          id: "1004",
          person: {
            id: "*****",
          },
          sequencing_requests: {
            hits: {
              edges: [
                {
                  node: {
                    person: {
                      id: "*****",
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        node: {
          id: "1006",
          person: {
            id: "*****",
          },
        },
      },
    ];

    maskPersons(data, fhirPersons);
    expect(data).to.eql(expected);
  });
});

describe("removeFullyRestrictedNodes", () => {
  it(`Should delete prescription from response`, () => {
    const expected = [
      {
        node: {
          id: "1001",
          person: {
            id: "1",
            first_name: "Doe",
            last_name: "John",
            ramq: "1231",
          },
          sequencing_requests: {
            hits: {
              edges: [
                {
                  node: {
                    person: {
                      id: "2",
                      first_name: "Doe",
                      last_name: "John",
                      ramq: "1232",
                    },
                  },
                },
                {
                  node: {
                    person: {
                      id: "3",
                      first_name: "Doe",
                      last_name: "John",
                      ramq: "1233",
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ];
    maskPersons(data, fhirPersons);
    const count = removeFullyRestrictedNodes(data);
    expect(data).to.eql(expected);
    expect(count).to.eql(2);
  });
});

describe("updateTotal", () => {
  it(`Should update total of Analysis and Sequencings`, () => {
    const analysis = {
      data: {
        Analyses: {
          hits: {
            edges: [
              {
                node: {
                  id: "1",
                },
              },
              {
                node: {
                  id: "2",
                },
              },
            ],
          },
        },
      },
    };

    const sequencings = {
      data: {
        Sequencings: {
          hits: {
            edges: [
              {
                node: {
                  id: "1",
                },
              },
            ],
          },
        },
      },
    };

    updateTotal(analysis, "Analyses", 2);
    updateTotal(sequencings, "Sequencings", 1);
    expect(analysis.data.Analyses.hits.total).to.eql(2);
    expect(sequencings.data.Sequencings.hits.total).to.eql(1);
  });
});

describe("getTotalAndIndexName", () => {
  it(`Should find total and index name`, () => {
    const analysis = {
      data: {
        Analyses: {
          hits: {
            edges: [
              {
                node: {
                  id: "1",
                },
              },
              {
                node: {
                  id: "2",
                },
              },
            ],
            total: 2,
          },
        },
      },
    };

    const sequencings = {
      data: {
        Sequencings: {
          hits: {
            edges: [
              {
                node: {
                  id: "1",
                },
              },
            ],
            total: 1,
          },
        },
      },
    };

    expect(getTotalAndIndexName(analysis)).to.eql({total: 2, indexName: "Analyses"});
    expect(getTotalAndIndexName(sequencings)).to.eql({total: 1, indexName: "Sequencings"});
  });
});
