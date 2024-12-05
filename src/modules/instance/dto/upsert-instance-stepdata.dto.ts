import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { UpsertTodoDto } from "../../todo/dto/upsert-todo.dto";

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

  @IsOptional()
  file: any;

  @IsOptional()
  @IsArray()
  todos?: UpsertTodoDto[];

  @IsNumber()
  @IsOptional()
  id?: number;
}
