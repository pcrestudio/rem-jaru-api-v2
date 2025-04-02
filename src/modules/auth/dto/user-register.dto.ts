import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpsertRegisterDto {
  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsString()
  email: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  authMethod?: string;

  @IsString()
  displayName?: string;

  @IsNumber()
  @IsOptional()
  roleId?: number;

  @IsNumber()
  @IsOptional()
  studioId?: number;

  @IsBoolean()
  @IsOptional()
  isSpecialist?: boolean;

  @IsNumber()
  @IsOptional()
  id?: number;
}
