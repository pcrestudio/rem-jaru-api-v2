import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../../core/database/prisma.service";
import { UtilsService } from "../../utils/utils.service";

@Injectable()
export class UpdateTodoTask {
  constructor(private readonly prisma: PrismaService) {}

  @Cron("*/1 * * * *") // Runs every day
  async updateUncheckTodos() {
    try {
      const todos = await this.prisma.toDo.findMany({
        where: {
          check: false,
        },
      });

      for (const todo of todos) {
        const masterOption = await UtilsService._getTodoState(
          this.prisma,
          todo.dateExpiration,
        );

        await this.prisma.toDo.update({
          data: {
            todoStateId: masterOption.id,
          },
          where: {
            id: todo.id,
          },
        });
      }

      return "updated";
    } catch (error) {
      console.error("Error en updateUncheckTodos", error);
      throw new InternalServerErrorException({
        message: "Error al actualizar tareas",
        details: error.message,
      });
    }
  }
}
