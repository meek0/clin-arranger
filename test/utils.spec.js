import { expect } from "chai";
import {
  extractValuesFromSqonByField,
  extractValuesFromContent,
} from "../app/utils.js";

describe("extractValuesFromContent", () => {
  it(`Should extract string value`, () => {
    expect(
      extractValuesFromContent({ field: "foo", value: "bar" }, "foo")
    ).to.eql(["bar"]);
  });
  it(`Should extract array value`, () => {
    expect(
      extractValuesFromContent({ field: "foo", value: ["bar1", "bar2"] }, "foo")
    ).to.eql(["bar1", "bar2"]);
  });
  it(`Should convert to string`, () => {
    expect(
      extractValuesFromContent({ field: "foo", value: [0, 1, "bar"] }, "foo")
    ).to.eql(["0", "1", "bar"]);
  });
});

describe("extractValuesFromSqonByField", () => {
  const sqon = {
    content: [
      {
        content: [
          {
            content: {
              field: "donors.patient_id",
              value: ['681481'],
            },
            op: "in",
          },
        ],
        op: "and",
      },
      {
        content: [
          {
            content: {
              field: "consequences.consequences",
              index: "Variants",
              value: ["NMD_transcript_variant"],
            },
            op: "in",
          },
          {
            content: {
              field: "donors.patient_id",
              value: ["681482"],
            },
            op: "in",
          },
          {
            content: {
              field: "chromosome",
              index: "Variants",
              value: ["19", "12", "6"],
            },
            op: "in",
          },
        ],
        op: "and",
        pivot: "donors",
      },
      {
        content: {
          field: "donors.patient_id",
          value: ['681481'],
        },
        op: "in",
      },
    ],
    op: "and",
    pivot: "donors",
  };
  it(`Should extract string value`, () => {
    expect(extractValuesFromSqonByField(sqon, "donors.patient_id")).to.eql([
      "681481",
      "681482",
    ]);
  });
});
