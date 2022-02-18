import { expect } from "chai";
import { pathIsAllowed } from "../src/controllers/arrangerRoutesHandler.js";

describe("Routes Guard", () => {
  it(`allow only allowed paths`, () => {
    expect(pathIsAllowed("/a/graphql")).false;
    expect(pathIsAllowed("/a_clin/graphql")).false;

    expect(pathIsAllowed("/clin/graphql")).true;
    expect(pathIsAllowed("/clin_2022_01_01_v1/graphql")).true;
    expect(pathIsAllowed("/clin/ping")).true;
    expect(pathIsAllowed("/admin/ping")).true;
  });
});
