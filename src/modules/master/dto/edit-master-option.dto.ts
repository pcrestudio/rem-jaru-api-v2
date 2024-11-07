import { IsNumber, IsString } from "class-validator";

export class EditMasterOptionDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsNumber()
  moduleId: number;

  @IsNumber()
  masterId: number;

  @IsNumber()
  id: number;
}
