import { IsNumber, IsString } from "class-validator";

export class CreateModuleDto {
  @IsString()
  name: string;

  @IsNumber()
  order: number;

  @IsString()
  slug: string;
}
