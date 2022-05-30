export const joinWithPadding = (l) =>
  l.reduce((xs, x) => xs + `${x}`.padStart(2, "0"), "");

export const makeFilenameDatePart = (date) => {
  const prefixes = joinWithPadding([
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
  ]);
  const suffixes = joinWithPadding([
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  ]);
  return `${prefixes}T${suffixes}Z`;
};

export const setSpreadSheetHeaders = (res, filename) => {
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  if (filename) {
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  }
  return res;
};

const ROW_NUMBER_OF_HEADER = 1;
export const isHeader = (n) => n === ROW_NUMBER_OF_HEADER;
