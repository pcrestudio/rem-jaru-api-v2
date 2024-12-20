import { Module } from "@nestjs/common";
import { TodoController } from "./todo.controller";
import { TodoService } from "./todo.service";
import { CustomPaginationModule } from "../custom_pagination/custom_pagination.module";

@Module({
  providers: [TodoService],
  controllers: [TodoController],
  imports: [CustomPaginationModule],
})
export class TodoModule {}
