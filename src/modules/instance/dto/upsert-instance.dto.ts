import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpsertInstanceDto {
  @IsString()
  title: string;

  @IsNumber()
  @IsOptional()
  submoduleId?: number;

  @IsNumber()
  moduleId?: number;

  @IsBoolean()
  isGlobal: boolean;

  @IsNumber()
  @IsOptional()
  id?: number;
}
