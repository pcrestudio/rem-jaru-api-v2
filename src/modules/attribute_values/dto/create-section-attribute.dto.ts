import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Transform } from "class-transformer";

export enum DataType {
  TEXT = "TEXT",
  TEXTAREA = "TEXTAREA",
  INTEGER = "INTEGER",
  FLOAT = "FLOAT",
  DATE = "DATE",
  LIST = "LIST",
  FILE = "FILE",
  EMAIL = "EMAIL",
  BOOLEAN = "BOOLEAN",
}

export enum RowLayout {
  single = "single",
  twoColumns = "twoColumns",
  threeColumns = "threeColumns",
}

export class CreateSectionAttributeDto {
  @IsString()
  label: string;

  @IsString()
  slug: string;

  @IsBoolean()
  isActive: boolean;

  @IsBoolean()
  @IsOptional()
  isForReport?: boolean;

  @IsBoolean()
  @IsOptional()
  conditionalRender?: boolean;

  @IsNumber()
  sectionId: number;

  @IsNumber()
  order: number;

  @IsEnum(RowLayout)
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
