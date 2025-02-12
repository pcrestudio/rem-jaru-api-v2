import {
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  WidthType,
} from "docx";
import AngloSingleTableHeaderCell from "./anglo_table_single_header_cell";

export const tablePrincipalSituation = (principalSituation: string) =>
  new Table({
    rows: [
      AngloSingleTableHeaderCell("Principales Actuados", "347ff6"),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(principalSituation)],
          }),
        ],
      }),
    ],
    columnWidths: [9010],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.AUTOFIT,
  });

export const tableTitle = new Table({
  rows: [AngloSingleTableHeaderCell("FICHA DE RESUMEN DE PROCESOS", "031795")],
  columnWidths: [9010],
  width: { size: 100, type: WidthType.PERCENTAGE },
  layout: TableLayoutType.AUTOFIT,
});

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
