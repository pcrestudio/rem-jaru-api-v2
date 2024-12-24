import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSectionDto {
  @IsString()
  label: string;

  @IsNumber()
  order: number;

  @IsBoolean()
  collapsable: boolean;

  @IsBoolean()
  @IsOptional()
  isSection?: boolean;
}
