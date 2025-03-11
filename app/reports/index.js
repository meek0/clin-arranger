import ExcelJS from "exceljs";

const COMMON_FONT_SIZE = 9;

const COMMON_CELL_FONT_STYLE = Object.freeze({
  size: COMMON_FONT_SIZE,
  name: "Arial",
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
  let autoFilter = false;
  return {
    eachRowExtra: function (cb) {
      eachRowCb = cb;
      return this;
    },
    eachCellExtra: function (cb) {
      eachCellCb = cb;
      return this;
    },
    withAutoFilter: function (af) {
      autoFilter = af;
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
            vertical: "top",
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
      if(autoFilter){
        const lastColumnLetter = String.fromCharCode(65 + sheetColumns.length - 1);
        sheet.autoFilter = {
          from: 'A1',
          to: `${lastColumnLetter}1`
        };
      }
      return [workbook, sheet];
    },
  };
}
