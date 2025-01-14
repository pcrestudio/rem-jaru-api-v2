export const judicialProcessHeadersConfig = [
  { key: "fileCode", header: "Código de expediente" },
  { key: "demanded", header: "Demandante" },
  { key: "plaintiff", header: "Demandado" },
  { key: "coDefendant", header: "Co-demandado" },
  { key: "responsible.displayName", header: "Responsable" },
  { key: "project.name", header: "Proyecto" },
  { key: "studio.name", header: "Estudio" },
  {
    key: "sectionAttributeValues[0].attributeName",
    header: "Atributo Sección 1",
  },
  {
    key: "globalAttributeValues[0].attributeValue",
    header: "Atributo Global 1",
  },
  {
    key: "globalAttributeValues[1].attributeValue",
    header: "Atributo Global 2",
  },
];

const mappingHeaderBySlug: Record<string, string> = {
  provisionAmount: "Monto ",
  provisionContingency: "",
  amount: "",
};
