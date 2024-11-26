import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpsertInstanceStepDto {
  @IsString()
  name: string;

  @IsNumber()
  instanceId: number;

  @IsBoolean()
  @IsOptional()
  isGlobal: boolean;

  @IsNumber()
  @IsOptional()
  id?: number;
}
