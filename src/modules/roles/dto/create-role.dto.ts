import { IsString } from "class-validator";

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsString()
  title: string;

  @IsString()
  description: string;
}
