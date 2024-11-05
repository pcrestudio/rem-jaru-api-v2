import { IsNumber, IsString } from "class-validator";

export class CreateMasterOptionDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsNumber()
  masterId: number;
}
