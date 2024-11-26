import { IsArray, IsString } from "class-validator";
import { DataType } from "./create-section-attribute.dto";

export class CreateSectionAttributeValueGroup {
  @IsArray({ each: true })
  attributes: CreateSectionAttributeValueDto[];

  @IsString()
  entityReference: string;
}

export class CreateSectionAttributeValueDto {
  value: string | object | number | any;

  @IsString()
  attributeSlug: string;

  @IsString()
  type: DataType;
}
