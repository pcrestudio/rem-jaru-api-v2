import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { UpsertInstanceDto } from "./dto/upsert-instance.dto";
import { UpsertInstanceStepDto } from "./dto/upsert-instance-step.dto";
import { UpsertInstanceStepDataDto } from "./dto/upsert-instance-stepdata.dto";
import { TodoService } from "../todo/todo.service";
import { Request, Response } from "express";
import { UpsertTodoDto } from "../todo/dto/upsert-todo.dto";
import { getModelByEntityReference } from "../../common/utils/entity_reference_mapping";
import * as path from "path";
import * as fs from "fs";

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
    userId: number,
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
            userId,
          );
        }
      }

      return { message: "Datos procesados correctamente" };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getInstanceSteps(entityReference: string) {
    const model = getModelByEntityReference(entityReference);
    const result = await this.prisma[`${model}`].findFirst({
      include: {
        submodule: {
          include: {
            module: true,
          },
        },
      },
    });

    return this.prisma.instance.findMany({
      where: {
        OR: [
          {
            moduleId: result.submodule.module.id,
          },
        ],
      },
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

  async exportDocument(fileName: string) {
    const filePath = path.join(process.cwd(), "upload", fileName);

    if (!fs.existsSync(filePath)) {
      throw new BadRequestException("El archivo no existe");
    }

    return fs.readFileSync(filePath);
  }
}
