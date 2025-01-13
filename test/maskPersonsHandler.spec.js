import { expect } from "chai";
import {
  extractPersonIds,
  maskPersons,
} from "../app/controllers/maskPersonsHandler.js";

describe("extractPersonIds", () => {
  it(`Should extract person IDs`, () => {
    const data = [
      {
        node: {
          id: "4731",
          person: {
            id: "1",
            first_name: "Doe",
            last_name: "John",
            ramq: "AAAA11112335",
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
                      ramq: "AAAA11112335",
                    },
                  },
                },
                {
                  node: {
                    patient_relationship: "MTH",
                    patient_disease_status: "NEG",
                    task_runname: "runNameExample",
                    person: {
                      id: "3",
                      first_name: "Doe",
                      last_name: "Jane",
                      ramq: "ABCF12145659",
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
          id: "1420",
          person: {
            id: "4",
            first_name: "Doe",
            last_name: "John",
            ramq: "AAAA11112234",
          },
          sequencing_requests: {
            hits: {
              edges: [
                {
                  node: {
                    person: {
                      id: "5",
                      first_name: "Doe",
                      last_name: "Jane",
                      ramq: "ABCF12345679",
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ];

    expect(extractPersonIds(data)).to.eql(["1", "2", "3", "4", "5"]);
  });
});

describe("maskPersons", () => {
  it(`Should mask person infos`, () => {
    const data = [
      {
        node: {
          id: "4731",
          person: {
            id: "1",
            first_name: "Doe",
            last_name: "John",
            ramq: "AAAA11112335",
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
                      ramq: "AAAA11112335",
                    },
                  },
                },
                {
                  node: {
                    patient_relationship: "MTH",
                    patient_disease_status: "NEG",
                    task_runname: "runNameExample",
                    person: {
                      id: "3",
                      first_name: "Doe",
                      last_name: "Jane",
                      ramq: "ABCF12145659",
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
          id: "1420",
          person: {
            id: "4",
            first_name: "Doe",
            last_name: "John",
            ramq: "AAAA11112234",
          },
          sequencing_requests: {
            hits: {
              edges: [
                {
                  node: {
                    person: {
                      id: "5",
                      first_name: "Doe",
                      last_name: "Jane",
                      ramq: "ABCF12345679",
                    },
                  },
                },
              ],
            },
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
            value: "***RAMQ***",
          },
        ],
        name: [
          {
            family: "***FIRST_NAME***",
            given: ["***LAST_NAME***"],
          },
        ],
      },
      {
        resourceType: "Person",
        id: "4",
        identifier: [
          {
            type: {
              coding: [
                {
                  code: "JHN",
                },
              ],
            },
            value: "******",
          },
        ],
        name: [
          {
            family: "******",
            given: ["******"],
          },
        ],
      },
    ];

    const expected = [
      {
        node: {
          id: "4731",
          person: {
            id: "1",
            first_name: "***FIRST_NAME***",
            last_name: "***LAST_NAME***",
            ramq: "***RAMQ***",
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
                      ramq: "AAAA11112335",
                    },
                  },
                },
                {
                  node: {
                    patient_relationship: "MTH",
                    patient_disease_status: "NEG",
                    task_runname: "runNameExample",
                    person: {
                      id: "3",
                      first_name: "Doe",
                      last_name: "Jane",
                      ramq: "ABCF12145659",
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
          id: "1420",
          person: {
            id: "4",
            first_name: "******",
                      last_name: "******",
                      ramq: "******",
          },
          sequencing_requests: {
            hits: {
              edges: [
                {
                  node: {
                    person: {
                      id: "5",
                      first_name: "Doe",
                      last_name: "Jane",
                      ramq: "ABCF12345679",
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
    expect(data).to.eql(expected);
  });
});
