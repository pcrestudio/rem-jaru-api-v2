import { IsArray, IsNumber, IsString } from "class-validator";
import { DataType } from "./create-section-attribute.dto";

export class CreateSectionAttributeValueGroup {
  @IsArray({ each: true })
  attributes: CreateSectionAttributeValueDto[];

  @IsNumber()
  entityReference: number;
}

export class CreateSectionAttributeValueDto {
  value: string | object | number | any;

  @IsString()
  attributeSlug: string;

  @IsString()
  type: DataType;
}
