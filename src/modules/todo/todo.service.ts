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
import { UpsertTodoActivityDto } from "./dto/upsert-todo-activity.dto";
import { RoleConfig } from "../../config/role.config";
import { MessagesConfig } from "../../config/messages.config";
import editTodoTemplate from "./templates/edit-todo.tpl";
import { GetTodoDto } from "./dto/get-todo.dto";

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
          dateExpiration: dateExpiration,
        },
        update: {
          title: todo.title,
          description: todo.description,
          creatorId: userId,
          responsibleId: todo.responsibleId,
          todoStateId: masterOption.id,
          check: todo.check ?? false,
          dateExpiration: dateExpiration,
        },
        where: {
          id: todo.id ?? 0,
          entityReference: todo.entityReference,
        },
      });

      await this.sendTodoEmail(
        todoUpsert,
        editTodoTemplate,
        MessagesConfig.todoEdit,
      );

      return todoUpsert;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getTodosByInstance(filter: FilterTodoDto) {
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
            entityReference: filter.entityReference,
            entityStepReference: filter.entityStepReference,
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

  async getTodos(filter: FilterTodoDto, userId: number) {
    // Verificamos si el usuario es un superadmin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        UserRole: {
          include: {
            role: true,
          },
        },
      },
    });

    const isSuperAdmin = user?.UserRole?.some(
      (userRole) =>
        userRole.role.name === RoleConfig["super-admin"] ||
        userRole.role.name === RoleConfig.admin,
    );

    // Si es superadmin o admin puede ver todos los to-dos
    const whereFields = isSuperAdmin
      ? {} // No se filtra nada, ve todo
      : {
          AND: [
            {
              OR: [
                { creator: { id: userId } }, // To-dos creados por el usuario
                { responsibleId: userId }, // To-dos asignados al usuario
              ],
            },
            ...(filter.check ? [{ check: filter.check === "true" }] : []),
            ...(filter.alert ? [{ alert: filter.alert === "true" }] : []),
            ...(filter.state ? [{ todoStateId: Number(filter.state) }] : []),
            ...(filter.responsibleId
              ? [{ responsible: { id: Number(filter.responsibleId) } }]
              : []),
          ],
        };

    // Obtener los to-dos con paginación
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
            creator: {
              include: {
                UserRole: {
                  include: {
                    role: true,
                  },
                },
              },
            },
            todoActivities: {
              include: {
                responsible: true,
              },
            },
          },
          whereFields,
        },
      );

    // Procesamos los resultados
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
              where: { entityReference: todo.entityReference },
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

    const filteredResults = processedResults.filter((result) => {
      const matchesModuleId = filter.moduleId
        ? result?.detail?.submodule?.module?.id === Number(filter.moduleId)
        : true;

      const matchesSubmoduleId = filter.submoduleId
        ? result?.detail?.submodule?.id === Number(filter.submoduleId)
        : true;

      const matchesFileCode = filter.search
        ? result.detail?.fileCode.includes(filter.search)
        : true;

      const matchesStudio = isSuperAdmin
        ? true
        : filter.cargoStudioId
          ? result.detail?.cargoStudioId === Number(filter.cargoStudioId)
          : false;

      return (
        matchesModuleId &&
        matchesSubmoduleId &&
        matchesFileCode &&
        matchesStudio
      );
    });

    return {
      results: filteredResults.length ? filteredResults : [],
      page,
      pageSize,
      total,
      totalPages,
    };
  }

  async upsertTodoStep(
    { todos }: UpsertTodoStepDto,
    entityId: string,
    userId: number,
  ) {
    try {
      await Promise.all(
        todos.map(async (todo) => {
          const dateExpiration = processDate(todo.dateExpiration);
          const masterOption = await this._getTodoState(dateExpiration);

          const todoUpsert = await this.prisma.toDo.upsert({
            create: {
              title: todo.title,
              description: todo.description,
              creatorId: userId,
              responsibleId: todo.responsibleId,
              entityReference: todo.entityReference,
              entityStepReference: entityId,
              dateExpiration: dateExpiration,
              todoStateId: masterOption.id,
            },
            update: {
              title: todo.title,
              description: todo.description,
              creatorId: userId,
              responsibleId: todo.responsibleId,
              todoStateId: masterOption.id,
              dateExpiration: dateExpiration,
            },
            where: {
              id: todo.id ?? 0,
              entityReference: todo.entityReference,
            },
          });

          await this.sendTodoEmail(
            todoUpsert,
            assignTodoTemplate,
            MessagesConfig.todoCreate,
          );
        }),
      );

      return "Todos added";
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

  async deleteTodo(id: number) {
    try {
      return this.prisma.$transaction([
        this.prisma.todoActivity.deleteMany({
          where: {
            todoId: id,
          },
        }),
        this.prisma.toDo.delete({
          where: {
            id,
          },
        }),
      ]);
    } catch (error) {
      throw new InternalServerErrorException({
        message: `Error deleting todo ${id}`,
        error: error.message,
      });
    }
  }

  async upsertTodoActivity(
    todoActivities: UpsertTodoActivityDto,
    files: Express.Multer.File[],
    userId: number,
  ) {
    let fileConstance: string = "";

    if (files && files.length > 0) {
      const file = files.find((f) => f.fieldname === "file");

      fileConstance = file ? file.filename : "";
    } else if (todoActivities.file) {
      fileConstance = todoActivities.file;
    }

    try {
      return this.prisma.todoActivity.upsert({
        create: {
          activity: todoActivities.activity,
          responsibleId: userId,
          todoId: Number(todoActivities.todoId),
          file: fileConstance,
        },
        update: {
          activity: todoActivities.activity,
          file: fileConstance,
        },
        where: {
          id: todoActivities.id ? Number(todoActivities.id) : 0,
          todoId: todoActivities.todoId ? Number(todoActivities.todoId) : 0,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: "Activities not created",
        error: error.message,
      });
    }
  }

  async getTodoActivities(todoId: number) {
    return this.prisma.todoActivity.findMany({
      where: {
        todoId: todoId,
      },
      orderBy: {
        id: "desc",
      },
      include: {
        responsible: true,
      },
    });
  }

  async deleteActivity(todoActivityId: number) {
    return this.prisma.todoActivity.delete({
      where: {
        id: todoActivityId,
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

  private async sendTodoEmail(
    todo: GetTodoDto,
    template: any,
    message: string,
  ) {
    const { email, displayName } = await this.prisma.user.findFirst({
      where: {
        id: todo.responsibleId,
      },
    });

    const templateData = {
      displayName: displayName,
      title: todo.title,
    };

    return this.mail.sendWithTemplate(template, templateData, [email], message);
  }
}
