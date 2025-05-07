import { Workbook } from "exceljs";

export class ExportablesService {
  static async generateExcel(
    headers: { key: string; header: string }[],
    data: any[],
    options?: {
      sheetName?: string;
      title?: string;
      rowHeight?: number;
    },
  ): Promise<Buffer> {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet(options?.sheetName || "Sheet1");

    const totalColumns = headers.length;
    const lastColumnLetter = String.fromCharCode(64 + totalColumns);

    const titleRow = sheet.addRow([options?.title || "Reporte"]);
    sheet.mergeCells(`A1:${lastColumnLetter}1`);

    titleRow.getCell(1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    titleRow.getCell(1).font = {
      bold: true,
      size: 14,
      color: { argb: "FFFFFF" },
    };
    titleRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "031795" }, // Fondo negro
    };
    sheet.getRow(1).height = options?.rowHeight || 25;

    sheet.addRow([]);
    sheet.addRow([]);
    sheet.getRow(2).height = options?.rowHeight || 20;
    sheet.getRow(3).height = options?.rowHeight || 20;

    const headerRow = sheet.addRow(headers.map((header) => header.header));
    sheet.getRow(4).height = options?.rowHeight || 22;

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "031795" }, // Azul
      };
      cell.font = { color: { argb: "FFFFFF" }, bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    data.forEach((row, rowIndex) => {
      const dataRow = sheet.addRow(headers.map((header) => row[header.key]));
      sheet.getRow(5 + rowIndex).height = options?.rowHeight || 18;

      dataRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: rowIndex % 2 === 0 ? "E6F7FF" : "FFFFFF",
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

    // 6️⃣ Ajustar el ancho de las columnas automáticamente
    headers.forEach((header, index) => {
      sheet.getColumn(index + 1).width = Math.max(
        header.header.length + 5,
        ...data.map((row) => (row[header.key]?.toString() || "").length),
      );
    });

    // 7️⃣ Escribir el archivo en buffer
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
