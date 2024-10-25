import { IsNumber, IsString } from "class-validator";

export class CreateSubmoduleDto {
  @IsString()
  name: string;

  @IsNumber()
  order: number;

  @IsString()
  slug: string;

  @IsNumber()
  moduleId: number;
}
