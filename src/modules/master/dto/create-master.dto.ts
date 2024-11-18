import { IsNumber, IsString } from "class-validator";

export class CreateMasterDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsNumber()
  moduleId?: number;
}
