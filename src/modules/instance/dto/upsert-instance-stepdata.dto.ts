import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";
import { UpsertTodoDto } from "../../todo/dto/upsert-todo.dto";
import { ModelType } from "../../../common/utils/entity_reference_mapping";

export class UpsertInstanceStepDataDto {
  @IsArray()
  stepData: InstanceStepDataDto[];

  @IsEnum(ModelType)
  modelType: ModelType;
}

export class InstanceStepDataDto {
  @IsString()
  comments: string;

  @IsString()
  @IsOptional()
  choice?: string;

  @IsString()
  @IsOptional()
  resume?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  dateResume?: string;

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
