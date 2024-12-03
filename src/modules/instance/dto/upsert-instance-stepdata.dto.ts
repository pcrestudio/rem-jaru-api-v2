import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class UpsertInstanceStepDataDto {
  @IsArray()
  stepData: InstanceStepDataDto[];
}

export class InstanceStepDataDto {
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
