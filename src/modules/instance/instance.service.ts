import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { UpsertInstanceDto } from "./dto/upsert-instance.dto";
import { UpsertInstanceStepDto } from "./dto/upsert-instance-step.dto";
import { UpsertInstanceStepDataDto } from "./dto/upsert-instance-stepdata.dto";
import { TodoService } from "../todo/todo.service";
import { Request } from "express";
import { UpsertTodoDto } from "../todo/dto/upsert-todo.dto";

@Injectable()
export class InstanceService {
  constructor(
    private prisma: PrismaService,
    private todoService: TodoService,
  ) {}

  async upsertInstance(instance: UpsertInstanceDto) {
    return this.prisma.instance.upsert({
      create: {
        name: instance.name,
        submoduleId: instance.submoduleId,
        moduleId: instance.moduleId,
        isGlobal: instance.isGlobal,
      },
      update: {
        name: instance.name,
        submoduleId: instance.submoduleId,
        moduleId: instance.moduleId,
        isGlobal: instance.isGlobal,
      },
      where: {
        id: instance.id ?? 0,
      },
    });
  }

  async upsertInstanceStep(instanceStep: UpsertInstanceStepDto) {
    return this.prisma.step.upsert({
      create: {
        name: instanceStep.name,
        instanceId: instanceStep.instanceId,
        isGlobal: instanceStep.isGlobal,
      },
      update: {
        name: instanceStep.name,
        instanceId: instanceStep.instanceId,
        isGlobal: instanceStep.isGlobal,
      },
      where: {
        id: instanceStep.id ?? 0,
      },
    });
  }

  async upsertInstanceStepData(
    instanceStepData: UpsertInstanceStepDataDto,
    files: Express.Multer.File[],
    req: Request,
  ) {
    try {
      const stepDataWithFiles = instanceStepData.stepData.map((step, index) => {
        const file = files.find(
          (f) => f.fieldname === `stepData[${index}][file]`,
        );
        return { ...step, file: file || null };
      });

      for (const stepData of stepDataWithFiles) {
        if (stepData.comments === undefined || stepData.file === undefined)
          continue;

        const { entityReference } = await this.prisma.$extended.stepData.upsert(
          {
            create: {
              comments: stepData.comments,
              stepId: Number(stepData.stepId),
              file: stepData.file ? stepData.file.filename : undefined,
              entityReference: stepData.entityReference,
              completed: !!stepData.comments,
            },
            update: {
              comments: stepData.comments,
              stepId: Number(stepData.stepId),
              entityReference: stepData.entityReference,
              file:
                stepData.file && stepData.file.filename
                  ? stepData.file.filename
                  : undefined,
              completed: true,
            },
            where: {
              id: stepData.id ? Number(stepData.id) : 0,
            },
          },
        );

        if (stepData.todos && stepData.todos.length > 0 && !stepData.id) {
          const todos: UpsertTodoDto[] = JSON.parse(stepData.todos.toString());

          await this.todoService.upsertTodoStep(
            { todos },
            entityReference,
            req,
          );
        }
      }

      return { message: "Datos procesados correctamente" };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getInstanceSteps(entityReference: string) {
    return this.prisma.instance.findMany({
      include: {
        module: true,
        submodule: true,
        steps: {
          include: {
            stepData: {
              where: {
                entityReference,
              },
              select: {
                comments: true,
                file: true,
                completed: true,
                id: true,
                entityId: true,
              },
            },
          },
        },
      },
    });
  }
}