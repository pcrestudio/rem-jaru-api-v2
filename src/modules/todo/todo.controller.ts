import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { TodoService } from "./todo.service";
import { UpsertTodoDto } from "./dto/upsert-todo.dto";
import { FilterTodoDto } from "./dto/filter-todo.dto";
import { JwtAuthGuard } from "../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../shared/auth/guards/roles.guard";

@Controller("todos")
export class TodoController {
  constructor(private todoService: TodoService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("upsert")
  async upsertTodo(@Body() todo: UpsertTodoDto, @Req() req) {
    const user = req.user;
    return this.todoService.upsertTodo(todo, Number(user.userId));
  }

  @Get("instance")
  async getTodosByInstance(@Query() filter: FilterTodoDto) {
    return this.todoService.getTodosByInstance(filter);
  }

  @Get("")
  async getTodos(@Query() filter: FilterTodoDto, @Req() req) {
    const user = req.user;

    return this.todoService.getTodos(filter, Number(user.userId));
  }

  @Patch("alert/:id")
  async alertTodo(@Param("id") id: string) {
    return this.todoService.alertTodo(Number(id));
  }
}
