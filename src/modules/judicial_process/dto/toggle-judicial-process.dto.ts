import { IsBoolean, IsNumber } from "class-validator";

export class ToggleJudicialProcessDto {
  @IsNumber()
  id: number;

  @IsBoolean()
  isActive: boolean;
}
