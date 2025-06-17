import { utils, writeFile } from "xlsx";

/**
 * Export an array of objects to an Excel file.
 * @param {Object[]} data - Array of items to export
 * @param {string[]} fields - Fields to include in the export in order
 * @param {string} filename - Desired filename for the Excel file
 */
const exportToExcel = (data, fields = [], filename = "export.xlsx") => {
  const rows = data.map((item) => {
    const row = {};
    fields.forEach((f) => {
      row[f] = item[f] ?? "";
    });
    return row;
  });

  const ws = utils.json_to_sheet(rows, { header: fields });
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Data");
  writeFile(wb, filename);
};

export default exportToExcel;
