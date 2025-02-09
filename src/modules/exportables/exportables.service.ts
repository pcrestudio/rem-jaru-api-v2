import { Workbook } from "exceljs";

export class ExportablesService {
  static async generateExcel(
      headers: { key: string; header: string }[],
      data: any[],
      options?: {
        sheetName?: string;
      }
  ): Promise<Buffer> {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet(options?.sheetName || "Sheet1");

    // Add header row with styles
    const headerRow = sheet.addRow(headers.map((header) => header.header));
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "031795" }, // Primary color (R3 G23 B149)
      };
      cell.font = {
        color: { argb: "FFFFFF" }, // White text
        bold: true,
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Add data rows with alternate row colors
    data.forEach((row, rowIndex) => {
      const dataRow = sheet.addRow(headers.map((header) => row[header.key]));
      dataRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: rowIndex % 2 === 0 ? "347FF6" : "FFFFFF", // Secondary color (R52 G127 B246) or White
          },
        };
        cell.alignment = { horizontal: "left", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Adjust column widths
    headers.forEach((header, index) => {
      sheet.getColumn(index + 1).width = Math.max(
          header.header.length,
          ...data.map((row) => (row[header.key]?.toString() || "").length)
      );
    });

    // Write workbook to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  static getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      ".pdf": "application/pdf",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".docx":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xlsx":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
    return mimeTypes[extension] || "application/octet-stream";
  }
}