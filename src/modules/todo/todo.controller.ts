import { Body, Controller, Post, Req } from "@nestjs/common";
import { TodoService } from "./todo.service";
import { UpsertTodoDto } from "./dto/upsert-todo.dto";
import { Request } from "express";

@Controller("todo")
export class TodoController {
  constructor(private todoService: TodoService) {}

  @Post("upsert")
  async upsertTodo(@Body() todo: UpsertTodoDto, @Req() req: Request) {
    return this.todoService.upsertTodo(todo, req);
  }
}
