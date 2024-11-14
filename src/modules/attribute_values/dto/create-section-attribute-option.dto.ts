import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSectionAttributeOptionDto {
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
