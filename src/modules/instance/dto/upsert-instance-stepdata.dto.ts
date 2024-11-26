import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpsertInstanceStepDataDto {
  @IsString()
  comments: string;

  @IsString()
  entityReference: string;

  @IsNumber()
  stepId: number;

  @IsNumber()
  @IsOptional()
  id?: number;
}
