import { expect } from "chai";
import {
  arrangerQueryVisitor,
  extractReadPermissions,
} from "../src/permissionsUtils.js";
import { patients, prescriptions } from "../src/config/vars.js";
import { parse } from "graphql";

describe("Extract Read Permissions from Token", () => {
  it(`Should retrieve all resources requiring read permissions`, () => {
    const partOfParsedToken = {
      authorization: {
        permissions: [
          {
            scopes: ["read", "create"],
            rsname: "Practitioner",
          },
          {
            scopes: ["read", "create", "update"],
            rsname: "ServiceRequest",
          },
          {
            scopes: ["read", "create", "update"],
            rsname: "Patient",
          },
        ],
      },
    };
    const permissions = extractReadPermissions(partOfParsedToken, [
      "Patient",
      "ServiceRequest",
    ]);
    expect(permissions).to.have.members(["Patient", "ServiceRequest"]);
  });
});

describe("Visit Query", () => {
  const mockInitialValidationState = {
    gqlReadPermissions: [prescriptions, patients],
    permissionsFailed: false,
    addSecurityTags: false,
    filtersVariableNames: new Set(),
    hasPrescriptions: false,
  };

  it(`Should detect that security tags need to be added`, () => {
    const ast = parse(
      "query p($sqon: JSON, $first: Int, $offset: Int, $sort: [Sort]) { Prescriptions {    hits(filters: $sqon, first: $first, offset: $offset, sort: $sort) { edges { node { id  cid authoredOn patientInfo { cid lastName  firstName organization { cid  name } }  }  } total } } }"
    );
    const validationState = arrangerQueryVisitor(
      ast,
      mockInitialValidationState
    );
    expect(validationState).to.include({ addSecurityTags: true });
    expect(validationState).to.include({ permissionsFailed: false });
  });

  it(`Should detect that two different names for sqon is used (not allowed)`, () => {
    const ast = parse(
        "query p($sqon: JSON, $first: Int, $offset: Int, $sort: [Sort]) {  Patients { hits(filters: $sqon2) { edges { nodes { id } } } } Prescriptions { hits(filters: $sqon1, first: $first, offset: $offset, sort: $sort) { edges { node { id  cid authoredOn patientInfo { cid lastName  firstName organization { cid  name } }  }  } total } } }"
    );
    const validationState = arrangerQueryVisitor(
        ast,
        mockInitialValidationState
    );
    expect(validationState).to.include({ permissionsFailed: true });
  });
});
