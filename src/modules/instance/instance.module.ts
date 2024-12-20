import { Module } from "@nestjs/common";
import { InstanceController } from "./instance.controller";
import { InstanceService } from "./instance.service";
import { TodoService } from "../todo/todo.service";
import { CustomPaginationModule } from "../custom_pagination/custom_pagination.module";

@Module({
  providers: [InstanceService, TodoService],
  controllers: [InstanceController],
  imports: [CustomPaginationModule],
})
export class InstanceModule {}
