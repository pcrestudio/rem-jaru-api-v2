import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpsertRoleDto {
  @IsString()
  name: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsOptional()
  id?: number;
}
