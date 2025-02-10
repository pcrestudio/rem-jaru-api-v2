import { Workbook } from "exceljs";

export class ExportablesService {
  static async generateExcel(
    headers: { key: string; header: string }[],
    data: any[],
    options?: {
      sheetName?: string;
      title?: string; // Permitir un título opcional
      rowHeight?: number; // Altura personalizada para las filas
    },
  ): Promise<Buffer> {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet(options?.sheetName || "Sheet1");

    // 1️⃣ Determinar el total de columnas (según los headers)
    const totalColumns = headers.length;
    const lastColumnLetter = String.fromCharCode(64 + totalColumns); // Convertir número a letra (ej: 3 -> "C")

    // 2️⃣ Agregar título "Reporte" en la fila 1, fusionando celdas desde A hasta la última columna
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
    sheet.getRow(1).height = options?.rowHeight || 25; // Definir altura de la fila del título

    // 3️⃣ Agregar dos filas en blanco (fila 2 y 3)
    sheet.addRow([]);
    sheet.addRow([]);
    sheet.getRow(2).height = options?.rowHeight || 20; // Altura fila 2
    sheet.getRow(3).height = options?.rowHeight || 20; // Altura fila 3

    // 4️⃣ Agregar fila de headers en la fila 4
    const headerRow = sheet.addRow(headers.map((header) => header.header));
    sheet.getRow(4).height = options?.rowHeight || 22; // Altura fila de encabezados

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

    // 5️⃣ Agregar filas de datos desde la fila 5
    data.forEach((row, rowIndex) => {
      const dataRow = sheet.addRow(headers.map((header) => row[header.key]));
      sheet.getRow(5 + rowIndex).height = options?.rowHeight || 18; // Altura personalizada

      dataRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: rowIndex % 2 === 0 ? "E6F7FF" : "FFFFFF", // Alternar colores
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
