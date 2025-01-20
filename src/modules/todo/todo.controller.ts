import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { TodoService } from "./todo.service";
import { UpsertTodoDto } from "./dto/upsert-todo.dto";
import { FilterTodoDto } from "./dto/filter-todo.dto";
import { JwtAuthGuard } from "../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../shared/auth/guards/roles.guard";
import { UpsertTodoActivityDto } from "./dto/upsert-todo-activity.dto";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { multerConfig } from "../../config/multer.config";

@Controller("todos")
export class TodoController {
  constructor(private todoService: TodoService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("upsert")
  async upsertTodo(@Body() todo: UpsertTodoDto, @Req() req) {
    const user = req.user;
    return this.todoService.upsertTodo(todo, Number(user.userId));
  }

  @Post("upsert/activity")
  @UseInterceptors(AnyFilesInterceptor(multerConfig))
  async upsertTodoActivities(
    @Body() todoActivity: UpsertTodoActivityDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
  ) {
    const user = req.user;

    return this.todoService.upsertTodoActivity(
      todoActivity,
      files,
      Number(user.userId),
    );
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

  @Get("activities")
  async getTodoActivities(@Query("todoId") todoId: string) {
    return this.todoService.getTodoActivities(Number(todoId));
  }

  @Delete("activity")
  async deleteActivity(@Query("todoActivityId") todoActivityId: string) {
    return this.todoService.deleteActivity(Number(todoActivityId));
  }

  @Patch("alert/:id")
  async alertTodo(@Param("id") id: string) {
    return this.todoService.alertTodo(Number(id));
  }

  @Delete("delete/:id")
  async deleteTodo(@Param("id") id: string) {
    return this.todoService.deleteTodo(Number(id));
  }
}
