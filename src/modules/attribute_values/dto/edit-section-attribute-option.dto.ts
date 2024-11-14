import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class EditSectionAttributeOptionDto {
  @IsNumber()
  sectionAttributeOptionId: number;

  @IsNumber()
  attributeId: number;

  @IsString()
  optionLabel: string;

  @IsString()
  optionValue: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
