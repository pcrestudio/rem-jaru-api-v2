import { Module } from "@nestjs/common";
import { InstanceController } from "./instance.controller";
import { InstanceService } from "./instance.service";
import { TodoService } from "../todo/todo.service";

@Module({
  providers: [InstanceService, TodoService],
  controllers: [InstanceController],
})
export class InstanceModule {}
