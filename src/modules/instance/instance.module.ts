import { Module } from "@nestjs/common";
import { InstanceController } from "./instance.controller";
import { InstanceService } from "./instance.service";
import { TodoService } from "../todo/todo.service";
import { MailService } from "../../shared/mail/mail.service";

@Module({
  providers: [InstanceService, TodoService, MailService],
  controllers: [InstanceController],
})
export class InstanceModule {}
