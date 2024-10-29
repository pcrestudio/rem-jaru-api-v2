import { IsString } from "class-validator";

export class CreateMasterDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;
}
