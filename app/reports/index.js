import ExcelJS from "exceljs";


const excelWorksheetIllegalCharacters = [":", "\\", "/", "?", "*", "[", "]", "\""];

export function replaceExcelWorksheetIllegalChars(str) {
    return str.split('').map(char => excelWorksheetIllegalCharacters.includes(char) ? '_' : char).join('');
}


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

export function Report(worksheets, sheetColumns, sheetRows) {
  let eachRowCb = null;
  let eachCellCb = null;
  let autoFilter = false;

  function validateSheets() {
    worksheets.forEach(sheetName => {
      if (!sheetColumns.find(sheet => sheet[sheetName])) {
        throw new Error(`Sheet ${sheetName} is not included in sheetColumns`);
      }
      if (!sheetRows.find(sheet => sheet[sheetName])) {
        throw new Error(`Sheet ${sheetName} is not included in sheetRows`);
      }
    });
  }

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
      validateSheets();

      const workbook = new ExcelJS.Workbook();

      for (const sheetName of worksheets) {

        const workSheet = workbook.addWorksheet(sheetName);
        workSheet.columns = sheetColumns.find(sheet => sheet[sheetName])[sheetName];

        workSheet.addRows(sheetRows.find(sheet => sheet[sheetName])[sheetName]);
        workSheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
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
              eachCellCb(cell, cellNumber, isHeaderRow, sheetColumns.find(sheet => sheet[sheetName])[sheetName][cell._column._number - 1]?.cellHAlignment);
            }
          });
        });
        if(autoFilter){
          const lastColumnLetter = String.fromCharCode(65 + workSheet.columns.length - 1);
          workSheet.autoFilter = {
            from: 'A1',
            to: `${lastColumnLetter}1`
          };
        }
      }
        return workbook;
    },
  };
}