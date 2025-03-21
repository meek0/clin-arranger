import { Report } from "../app/reports/index.js";
import { expect } from "chai";

describe("validateSheets", () => {
  it("should throw an error if a sheet is not included in sheetColumns", () => {
    const worksheets = ["Sheet1", "Sheet2"];
    const sheetColumns = [{ Sheet1: [] }];
    const sheetRows = [{ Sheet1: [] }, { Sheet2: [] }];

    const report = Report(worksheets, sheetColumns, sheetRows);

    expect(() => report.build()).to.throw(
      "Sheet Sheet2 is not included in sheetColumns"
    );
  });

  it("should throw an error if a sheet is not included in sheetRows", () => {
    const worksheets = ["Sheet1", "Sheet2"];
    const sheetColumns = [{ Sheet1: [] }, { Sheet2: [] }];
    const sheetRows = [{ Sheet1: [] }];

    const report = Report(worksheets, sheetColumns, sheetRows);

    expect(() => report.build()).to.throw(
      "Sheet Sheet2 is not included in sheetRows"
    );
  });

  it("should not throw an error if all sheets are included in both sheetColumns and sheetRows", () => {
    const worksheets = ["Sheet1", "Sheet2"];
    const sheetColumns = [{ Sheet1: [] }, { Sheet2: [] }];
    const sheetRows = [{ Sheet1: [] }, { Sheet2: [] }];

    const report = Report(worksheets, sheetColumns, sheetRows);

    expect(() => report.build()).to.not.throw();
  });
});
