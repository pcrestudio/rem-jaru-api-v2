import { Paragraph, TableCell, TextRun, WidthType } from "docx";

const AngloTableCell = (label: string, value: string) => [
  new TableCell({
    children: [new Paragraph(label)],
  }),
  new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun(value)],
        alignment: "center",
      }),
    ],
    width: { size: 50, type: WidthType.PERCENTAGE },
  }),
];

export default AngloTableCell;
