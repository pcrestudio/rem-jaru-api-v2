import * as XLSX from "xlsx";

export class ExportablesService {
  static generateExcel(
    headers: { key: string; header: string }[],
    data: any[],
    options?: {
      sheetName?: string;
    },
  ): ArrayBuffer {
    const sheetName = options?.sheetName || "Sheet1";

    const formattedData = data.map((row) =>
      headers.reduce((acc, header) => {
        acc[header.header] = row[header.key];
        return acc;
      }, {}),
    );

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
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
