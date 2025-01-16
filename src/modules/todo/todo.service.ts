import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { UpsertTodoDto } from "./dto/upsert-todo.dto";
import { UpsertTodoStepDto } from "./dto/upsert-todo-step.dto";
import {
  Entities,
  entityReferenceMapping,
  EntityReferenceModel,
  getModelByEntityReference,
} from "../../common/utils/entity_reference_mapping";
import { CustomPaginationService } from "../custom_pagination/custom_pagination.service";
import { FilterTodoDto } from "./dto/filter-todo.dto";
import processDate from "../../common/utils/convert_date_string";
import { MasterTodosStates } from "../../config/master-todos-states.config";
import { MailService } from "../../shared/mail/mail.service";
import assignTodoTemplate from "./templates/assign-todo.tpl";

@Injectable()
export class TodoService {
  constructor(
    private prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async upsertTodo(todo: UpsertTodoDto, userId: number) {
    try {
      const dateExpiration = processDate(todo.dateExpiration);
      const masterOption = await this._getTodoState(dateExpiration);

      const todoUpsert = await this.prisma.toDo.upsert({
        create: {
          title: todo.title,
          description: todo.description,
          creatorId: userId,
          responsibleId: todo.responsibleId,
          entityReference: todo.entityReference,
          entityStepReference: todo.entityStepReference,
          todoStateId: masterOption.id,
          dateExpiration,
        },
        update: {
          ...todo,
          todoStateId: masterOption.id,
          dateExpiration,
        },
        where: {
          id: todo.id ?? 0,
          entityReference: todo.entityReference,
        },
      });

      const { email, displayName } = await this.prisma.user.findFirst({
        where: {
          id: todoUpsert.responsibleId,
        },
      });

      const templateData = {
        displayName: displayName,
        title: todoUpsert.title,
      };

      await this.mail.sendWithTemplate(
        assignTodoTemplate,
        templateData,
        [email],
        "To-Do asignado.",
      );

      return todoUpsert;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getTodosByInstance(filter: FilterTodoDto) {
    return CustomPaginationService._getPaginationModel(
      this.prisma,
      EntityReferenceModel.ToDo,
      {
        page: filter.page,
        pageSize: filter.pageSize,
        whereFields: {
          entityReference: filter.entityReference,
          entityStepReference: filter.entityStepReference,
        },
      },
    );
  }

  async getTodos(filter: FilterTodoDto, userId: number) {
    const { results, total, page, pageSize, totalPages } =
      await CustomPaginationService._getPaginationModel(
        this.prisma,
        EntityReferenceModel.ToDo,
        {
          page: filter.page,
          pageSize: filter.pageSize,
          includeConditions: {
            responsible: true,
            state: true,
          },
          whereFields: {
            OR: [
              {
                creator: {
                  id: userId,
                },
              },
              {
                responsibleId: userId,
              },
            ],
          },
        },
      );

    const processedResults = await Promise.all(
      results.map(async (todo: any) => {
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
            const entity = await this.prisma[`${model}`].findFirst({
              where: {
                entityReference: todo.entityReference,
              },
            });

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

    return {
      results: processedResults,
      page,
      pageSize,
      total,
      totalPages,
    };
  }

  async upsertTodoStep(
    { todos }: UpsertTodoStepDto,
    entityReference: string,
    userId: number,
  ) {
    try {
      for (const todo of todos) {
        const dateExpiration = processDate(todo.dateExpiration);
        const masterOption = await this._getTodoState(dateExpiration);

        await this.prisma.toDo.upsert({
          create: {
            title: todo.title,
            description: todo.description,
            creatorId: userId,
            responsibleId: todo.responsibleId,
            entityReference: entityReference,
            todoStateId: masterOption.id,
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

  async alertTodo(id: number) {
    return this.prisma.toDo.update({
      data: {
        alert: true,
      },
      where: {
        id,
      },
    });
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

  private _getTodoState(date: string) {
    const targetDate = new Date(date);
    const currentDate = new Date();

    const differenceInMilliseconds =
      targetDate.getTime() - currentDate.getTime();

    const differenceInDays = Math.floor(
      differenceInMilliseconds / (1000 * 60 * 60 * 24),
    );

    const masterSlug =
      differenceInDays >= 14
        ? MasterTodosStates.moreThanTwoWeeks
        : differenceInDays >= 0
          ? MasterTodosStates.lessThanTwoWeeks
          : MasterTodosStates.expired;

    return this.prisma.masterOption.findFirst({
      where: {
        slug: masterSlug,
      },
    });
  }
}
