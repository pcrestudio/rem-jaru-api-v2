import { IsOptional, IsString } from "class-validator";

export class UpsertIncidentDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  entityReference?: string;

  @IsString()
  @IsOptional()
  modelType?: string;
}
