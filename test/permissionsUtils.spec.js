import { expect } from "chai";
import { extractReadPermissions } from "../src/permissionsUtils.js";

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
