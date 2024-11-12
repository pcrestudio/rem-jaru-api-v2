import { IsBoolean, IsNumber, IsString } from "class-validator";

export class CreateSectionDto {
  @IsString()
  label: string;

  @IsNumber()
  order: number;

  @IsBoolean()
  collapsable: boolean;
}
