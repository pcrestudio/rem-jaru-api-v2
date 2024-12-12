import { IsNumber, IsString } from "class-validator";

export class UpsertMasterDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsNumber()
  moduleId?: number;

  @IsNumber()
  submoduleId?: number;

  @IsNumber()
  id?: number;
}
