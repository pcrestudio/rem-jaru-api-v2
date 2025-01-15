import {
  Paragraph,
  ShadingType,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

const AngloMultipleTableHeaderCell = (
  firstLabel: string,
  secondLabel: string,
) =>
  new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({
            text: firstLabel.toUpperCase(),
            shading: {
              color: "000FFF",
            },
          }),
        ],
        shading: {
          fill: "347ff6",
          type: ShadingType.CLEAR,
        },
        width: { size: 50, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: secondLabel.toUpperCase(),
            shading: {
              color: "000FFF",
            },
          }),
        ],
        shading: {
          fill: "347ff6",
          type: ShadingType.CLEAR,
        },
        width: { size: 50, type: WidthType.PERCENTAGE },
      }),
    ],
  });

export default AngloMultipleTableHeaderCell;
