import { GetSectionAttributesDto } from "../../modules/attribute_values/dto/get-section-attributes.dto";

export interface GetModuleAttributeValueDto {
  sectionAttributeValues: GetModuleAttributeDto[];
  globalAttributeValues: GetModulePlainAttributeDto[];
}

export interface GetModuleAttributeDto {
  sectionAttributeValueId: number;
  sectionAttributeId: number;
  value: string;
  createdAt: Date;
  modifiedAt: Date;
  createdBy: string;
  modifiedBy: string;
  entityReference: string;
  attribute: GetSectionAttributesDto;
}

export interface GetModulePlainAttributeDto {
  globalAttributeValueId: number;
  globalAttributeId: number;
  value: string;
  createdAt: Date;
  modifiedAt: Date;
  createdBy: string;
  modifiedBy: string;
  entityReference: string;
  attribute: GetSectionAttributesDto;
}
