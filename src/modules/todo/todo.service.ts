import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { UpsertTodoDto } from "./dto/upsert-todo.dto";
import { Request } from "express";
import { UpsertTodoStepDto } from "./dto/upsert-todo-step.dto";
import {
  Entities,
  entityReferenceMapping,
  getModelByEntityReference,
} from "../../utils/entity_reference_mapping";

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

  async getTodosByInstance(entityReference: string) {
    return this.prisma.toDo.findMany({
      where: {
        entityReference,
      },
    });
  }

  async getTodos() {
    const todos = await this.prisma.toDo.findMany({
      include: {
        responsible: true,
      },
    });

    return await Promise.all(
      todos.map(async (todo) => {
        try {
          const match = todo.entityReference.match(/^[^\d]+/);
          const model = match ? entityReferenceMapping[match[0]] : null;

          if (!model) {
            console.warn(
              `No se encontró un modelo para la referencia: ${todo.entityReference}`,
            );
            return { ...todo, submodule: null };
          }

          if (match?.[0] === Entities.ISD) {
            const entity = await this.prisma[`${model}`].findFirst();

            if (!entity) {
              console.warn(
                `No se encontró entidad para referencia: ${todo.entityReference}`,
              );
              return { ...todo, submodule: null };
            }

            const detail = await this.resolveSubmodule(entity.entityReference);
            return { ...todo, detail };
          }

          const detail = await this.resolveSubmodule(todo.entityReference);

          return { ...todo, detail };
        } catch (error) {
          console.error(
            `Error al procesar todo con referencia ${todo.entityReference}:`,
            error,
          );
          return { ...todo, submodule: null };
        }
      }),
    );
  }

  async upsertTodoStep(
    { todos }: UpsertTodoStepDto,
    entityReference: string,
    req?: Request,
  ) {
    try {
      for (const todo of todos) {
        await this.prisma.toDo.upsert({
          create: {
            title: todo.title,
            description: todo.description,
            creatorId: Number(req.sub),
            responsibleId: todo.responsibleId,
            entityReference: entityReference,
            todoStateId: todo.todoStateId,
          },
          update: todo,
          where: {
            id: todo.id ?? 0,
            entityReference: todo.entityReference,
          },
        });
      }

      return "Todo added";
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  private async resolveSubmodule(entityReference: string) {
    const model = getModelByEntityReference(entityReference);

    if (!model) {
      console.warn(
        `No se encontró un modelo para la referencia: ${entityReference}`,
      );
      return null;
    }

    try {
      return await this.prisma[`${model}`].findFirst({
        where: {
          entityReference: entityReference,
        },
        include: {
          submodule: {
            include: {
              module: true,
            },
          },
        },
      });
    } catch (error) {
      console.error(`Error al obtener submodule para ${model}:`, error);
      return null;
    }
  }
}