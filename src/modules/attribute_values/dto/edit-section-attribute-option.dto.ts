import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Transform } from "class-transformer";
import { DataType } from "./create-section-attribute.dto";

export class EditSectionAttributeOptionDto {
  @IsNumber()
  sectionAttributeOptionId: number;

  @IsNumber()
  attributeId: number;

  @IsString()
  optionLabel: string;

  @IsEnum(DataType)
  @Transform(({ value }) => value.toLowerCase())
  @IsOptional()
  dataType: DataType;

  @IsString()
  optionValue: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
