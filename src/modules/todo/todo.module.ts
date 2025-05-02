import { Module } from "@nestjs/common";
import { TodoController } from "./todo.controller";
import { TodoService } from "./todo.service";
import { MailService } from "../../shared/mail/mail.service";
import { UpdateTodoTask } from "./update-todo.task";

@Module({
  providers: [TodoService, MailService, UpdateTodoTask],
  controllers: [TodoController],
})
export class TodoModule {}
