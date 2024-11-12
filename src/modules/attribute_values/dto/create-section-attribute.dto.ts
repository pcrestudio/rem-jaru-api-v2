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

export class CreateSectionAttributeDto {
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
