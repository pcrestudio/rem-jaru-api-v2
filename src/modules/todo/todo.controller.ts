import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import { TodoService } from "./todo.service";
import { UpsertTodoDto } from "./dto/upsert-todo.dto";
import { Request } from "express";
import { FilterTodoDto } from "./dto/filter-todo.dto";

@Controller("todos")
export class TodoController {
  constructor(private todoService: TodoService) {}

  @Post("upsert")
  async upsertTodo(@Body() todo: UpsertTodoDto, @Req() req: Request) {
    return this.todoService.upsertTodo(todo, req);
  }

  @Get("instance")
  async getTodosByInstance(@Query() filter: FilterTodoDto) {
    return this.todoService.getTodosByInstance(filter);
  }

  @Get("")
  async getTodos(@Query() filter: FilterTodoDto) {
    return this.todoService.getTodos(filter);
  }
}
