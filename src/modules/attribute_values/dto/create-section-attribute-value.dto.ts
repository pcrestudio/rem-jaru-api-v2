import { IsArray, IsEnum, IsString } from "class-validator";
import { DataType } from "./create-section-attribute.dto";
import { ModelType } from "../../../common/utils/entity_reference_mapping";

export class CreateSectionAttributeValueGroup {
  @IsArray({ each: true })
  attributes: CreateSectionAttributeValueDto[];

  @IsString()
  entityReference: string;

  @IsEnum(ModelType)
  modelType: ModelType;
}

export class CreateSectionAttributeValueDto {
  value: string | object | number | any;

  @IsString()
  attributeSlug: string;

  @IsString()
  type: DataType;
}
