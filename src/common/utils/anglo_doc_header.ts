import {
  AlignmentType,
  Header,
  ImageRun,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

export const angloDocHeader = (buffer: Buffer) =>
  new Header({
    children: [
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new ImageRun({
                        type: "png",
                        data: buffer,
                        transformation: { width: 100, height: 50 },
                      }),
                    ],
                    alignment: AlignmentType.LEFT,
                  }),
                ],
                width: { size: 50, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: new Date().toLocaleDateString("es-ES"),
                        bold: true,
                      }),
                    ],
                    alignment: AlignmentType.RIGHT,
                  }),
                ],
                width: { size: 50, type: WidthType.PERCENTAGE },
              }),
            ],
          }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
      }),
    ],
  });
