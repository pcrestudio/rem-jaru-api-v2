import { IsString } from "class-validator";

export class UserAuthDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}
