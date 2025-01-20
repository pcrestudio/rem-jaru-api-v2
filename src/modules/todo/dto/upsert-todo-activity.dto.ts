import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpsertTodoActivityDto {
  @IsNumber()
  todoId: number;

  @IsString()
  activity: string;

  @IsString()
  file: string;

  @IsNumber()
  responsibleId: number;

  @IsNumber()
  @IsOptional()
  id?: number;
}
