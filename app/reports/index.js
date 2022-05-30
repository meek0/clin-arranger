import ExcelJS from "exceljs";

const COMMON_FONT_SIZE = 12;

const COMMON_CELL_FONT_STYLE = Object.freeze({
  size: COMMON_FONT_SIZE,
  name: "Calibri",
});

const COMMON_CELL_BORDER_STYLE = Object.freeze({
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
});

const ROW_NUMBER_OF_HEADER = 1;
export const isHeader = (n) => n === ROW_NUMBER_OF_HEADER;

export default function Report(sheetColumns, rows) {
  let eachRowCb = null;
  let eachCellCb = null;
  return {
    eachRowExtra: function (cb) {
      eachRowCb = cb;
      return this;
    },
    eachCellExtra: function (cb) {
      eachCellCb = cb;
      return this;
    },
    build: function () {
      const workbook = new ExcelJS.Workbook();

      const sheet = workbook.addWorksheet("Sheet1");
      sheet.columns = sheetColumns;

      sheet.addRows(rows);
      sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        if (eachRowCb) {
          eachRowCb(row, rowNumber);
        }
        row.eachCell({ includeEmpty: true }, (cell, cellNumber) => {
          const isHeaderRow = isHeader(rowNumber);
          cell.style = {
            font: { ...COMMON_CELL_FONT_STYLE, bold: isHeaderRow },
          };
          cell.alignment = {
            vertical: "bottom",
            horizontal: "left",
            wrapText: true,
          };
          cell.border = {
            ...COMMON_CELL_BORDER_STYLE,
          };
          if (eachCellCb) {
            eachCellCb(cell, cellNumber, isHeaderRow);
          }
        });
      });
      return [workbook, sheet];
    },
  };
}
