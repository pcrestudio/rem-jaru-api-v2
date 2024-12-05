import { IsArray } from "class-validator";
import { UpsertTodoDto } from "./upsert-todo.dto";

export class UpsertTodoStepDto {
  @IsArray()
  todos: UpsertTodoDto[];
}
