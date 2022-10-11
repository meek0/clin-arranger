import { expect } from "chai";
import {
  isGenetician,
  arrangerQueryVisitor,
  extractReadPermissions,
} from "../app/permissionsUtils.js";
import { sequencings, rsServiceRequest } from "../config/vars.js";
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
            rsname: rsServiceRequest,
          },
        ],
      },
    };
    const permissions = extractReadPermissions(partOfParsedToken, [
      rsServiceRequest,
    ]);
    expect(permissions).to.have.members([rsServiceRequest]);
  });
});

describe("Visit Query", () => {
  const mockInitialValidationState = {
    gqlReadPermissions: [sequencings],
    permissionsFailed: false,
    addSecurityTags: false,
    filtersVariableNames: new Set(),
  };

  it(`Should detect that security tags need to be added`, () => {
    const ast = parse(
      "query p($sqon: JSON, $first: Int, $offset: Int, $sort: [Sort]) { Sequencings {  hits(filters: $sqon, first: $first, offset: $offset, sort: $sort) { edges { node { analysis_code }  }  } total } }"
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
      "query p($sqon: JSON, $first: Int, $offset: Int, $sort: [Sort]) {  Sequencings { hits(filters: $sqon2) { edges { nodes { patient_id } } } } Analyses { hits(filters: $sqon1, first: $first, offset: $offset, sort: $sort) { edges { node { patient_id }  } total } } }"
    );
    const validationState = arrangerQueryVisitor(
      ast,
      mockInitialValidationState
    );
    expect(validationState).to.include({ permissionsFailed: true });
  });
});

describe('isGenetician', () => {
  it(`Should return true`, () => {
    const parsedToken = {
      realm_access: {
        roles: [
          'clin_genetician'
        ]
    }}
    expect(isGenetician(parsedToken)).to.be.true;
  })
  it(`Should return false`, () => {
    expect(isGenetician({})).to.be.false;
    const parsedToken = {
      realm_access: {
        roles: [
          'clin_prescriber'
        ]
    }}
    expect(isGenetician(parsedToken)).to.be.false;
  })
})
