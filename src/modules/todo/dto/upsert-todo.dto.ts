import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpsertTodoDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  entityReference: string;

  @IsString()
  entityStepReference: string;

  @IsNumber()
  todoStateId: number;

  @IsNumber()
  responsibleId: number;

  @IsNumber()
  @IsOptional()
  id?: number;
}
