import { IsNumber } from "class-validator";

export class CreateExchangeDto {
  @IsNumber()
  value: number;
}
