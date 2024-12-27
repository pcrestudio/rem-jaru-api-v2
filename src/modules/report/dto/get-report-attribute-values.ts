export interface GetReportAttributeValues {
  sectionAttributeId: number;
  slug: string;
  label: string;
  values: GetAttributeValueDto[];
  options: {
    optionLabel: string;
    optionValue: string;
  }[];
}

export interface GetAttributeValueDto {
  value: string;
}
