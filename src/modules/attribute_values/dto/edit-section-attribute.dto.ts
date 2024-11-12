import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Transform } from "class-transformer";
import { DataType } from "./create-section-attribute.dto";

export class EditSectionAttributeDto {
  @IsNumber()
  sectionAttributeId: number;

  @IsString()
  label: string;

  @IsString()
  slug: string;

  @IsBoolean()
  isActive: boolean;

  @IsNumber()
  sectionId: number;

  @IsNumber()
  order: number;

  @IsString()
  rowLayout: string;

  @IsEnum(DataType)
  @Transform(({ value }) => value.toLowerCase())
  dataType: DataType;

  @IsOptional()
  @IsNumber()
  moduleId: number;

  @IsOptional()
  @IsNumber()
  submoduleId: number;
}
