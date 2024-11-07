import { IsBoolean, IsNumber } from "class-validator";

export class ToggleMasterOptionDto {
  @IsNumber()
  id: number;

  @IsBoolean()
  isActive: boolean;
}
