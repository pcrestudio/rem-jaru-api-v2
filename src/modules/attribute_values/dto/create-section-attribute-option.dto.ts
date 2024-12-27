import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSectionAttributeOptionDto {
  @IsNumber()
  attributeId: number;

  @IsNumber()
  @IsOptional()
  sectionAttributeId?: number;

  @IsNumber()
  @IsOptional()
  globalAttributeId?: number;

  @IsString()
  optionLabel: string;

  @IsString()
  optionValue: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
