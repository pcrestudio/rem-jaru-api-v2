import { Paragraph, TableCell, TextRun, VerticalAlign, WidthType } from "docx";

const AngloTableCell = (label: string, value: string) => [
  new TableCell({
    children: [new Paragraph(label)],
    verticalAlign: VerticalAlign.CENTER,
    width: { size: 4505, type: WidthType.DXA },
    margins: { top: 200, bottom: 200, left: 200, right: 200 },
  }),
  new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun(value)],
        alignment: "center",
      }),
    ],
    verticalAlign: VerticalAlign.CENTER,
    width: { size: 4505, type: WidthType.DXA },
    margins: { top: 200, bottom: 200, left: 200, right: 200 },
  }),
];

export default AngloTableCell;
