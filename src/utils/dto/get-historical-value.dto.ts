import { GetSectionAttributesValuesDto } from "../../modules/attribute_values/dto/get-section-attributes-values.dto";
import { GetSectionAttributesDto } from "../../modules/attribute_values/dto/get-section-attributes.dto";

export interface GetHistoricalValueDto {
  id: number;
  sectionAttributeValueId: number;
  oldValue: string;
  changeDate: Date;
  changedBy: string;
  sectionAttribute?: SectionAttribute;
}

export interface SectionAttribute extends GetSectionAttributesValuesDto {
  attribute: GetSectionAttributesDto;
}
