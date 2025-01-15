import { Paragraph, ShadingType, TableCell, TableRow, WidthType } from "docx";

const AngloSingleTableHeaderCell = (firstLabel: string, color: string) =>
  new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({
            text: firstLabel.toUpperCase(),
          }),
        ],
        shading: {
          fill: color,
          type: ShadingType.CLEAR,
        },
        width: { size: 100, type: WidthType.PERCENTAGE },
      }),
    ],
  });

export default AngloSingleTableHeaderCell;
