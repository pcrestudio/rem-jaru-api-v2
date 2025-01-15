import { Module } from "@nestjs/common";
import { TodoController } from "./todo.controller";
import { TodoService } from "./todo.service";
import { MailService } from "../../shared/mail/mail.service";

@Module({
  providers: [TodoService, MailService],
  controllers: [TodoController],
})
export class TodoModule {}
