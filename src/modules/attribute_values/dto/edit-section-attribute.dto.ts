import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Transform } from "class-transformer";
import { DataType, RowLayout } from "./create-section-attribute.dto";

export class EditSectionAttributeDto {
  @IsNumber()
  sectionAttributeId: number;

  @IsNumber()
  @IsOptional()
  globalAttributeId?: number;

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

  @IsEnum(RowLayout)
  @IsOptional()
  rowLayout: RowLayout;

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
