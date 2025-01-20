import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpsertIncidentDataDto {
  @IsString()
  headquarters: string;

  @IsString()
  comment: string;

  @IsString()
  fileCode: string;

  @IsNumber()
  instanceIncidentId: number;

  @IsNumber()
  @IsOptional()
  id?: number;
}
