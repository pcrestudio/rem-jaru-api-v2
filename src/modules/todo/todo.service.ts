import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { UpsertTodoDto } from "./dto/upsert-todo.dto";
import { Request } from "express";

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  async upsertTodo(todo: UpsertTodoDto, req: Request) {
    try {
      return this.prisma.toDo.upsert({
        create: {
          title: todo.title,
          description: todo.description,
          creatorId: Number(req.sub),
          responsibleId: todo.responsibleId,
          entityReference: todo.entityReference,
          todoStateId: todo.todoStateId,
        },
        update: todo,
        where: {
          id: todo.id ?? 0,
          entityReference: todo.entityReference,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
