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
import { UpsertTodoDto } from "../todo/dto/upsert-todo.dto";
import {
  Entities,
  getModelByEntityReference,
  getPrefixByEntityReference,
  ModelType,
} from "../../common/utils/entity_reference_mapping";
import * as path from "path";
import * as fs from "fs";
import processDate from "../../common/utils/convert_date_string";

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

  async upsertInstanceStepBulk(instanceStep: UpsertInstanceStepDto[]) {
    try {
      this.prisma.$transaction(async (tx) => {
        for (const step of instanceStep) {
          await tx.step.create({
            data: {
              name: step.name,
              instanceId: step.instanceId,
              isGlobal: step.isGlobal,
            },
          });
        }
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
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

        const fileTwo = files.find(
          (f) => f.fieldname === `stepData[${index}][fileTwo]`,
        );

        const fileThree = files.find(
          (f) => f.fieldname === `stepData[${index}][fileThree]`,
        );

        const fileFour = files.find(
          (f) => f.fieldname === `stepData[${index}][fileFour]`,
        );

        const fileFive = files.find(
          (f) => f.fieldname === `stepData[${index}][fileFive]`,
        );

        return {
          ...step,
          file: file || null,
          fileTwo: fileTwo || null,
          fileThree: fileThree || null,
          fileFour: fileFour || null,
          fileFive: fileFive || null,
        };
      });

      for (const stepData of stepDataWithFiles) {
        if (stepData.comments === undefined || stepData.file === undefined)
          continue;

        const entityReference =
          instanceStepData.modelType === ModelType.JudicialProcess
            ? { entityJudicialProcessReference: stepData.entityReference }
            : { entitySupervisionReference: stepData.entityReference };

        const dateResume = stepData.dateResume
          ? processDate(JSON.parse(stepData.dateResume))
          : "";

        const { entityId } = await this.prisma.$extended.stepData.upsert({
          create: {
            comments: stepData.comments,
            choice: stepData.choice ?? undefined,
            resume: stepData.resume ?? undefined,
            dateResume,
            stepId: Number(stepData.stepId),
            file: stepData.file ? stepData.file.filename : undefined,
            fileTwo: stepData.fileTwo ? stepData.fileTwo.filename : undefined,
            fileThree: stepData.fileThree
              ? stepData.fileThree.filename
              : undefined,
            fileFour: stepData.fileFour
              ? stepData.fileFour.filename
              : undefined,
            fileFive: stepData.fileFive
              ? stepData.fileFive.filename
              : undefined,
            modelType: instanceStepData.modelType,
            completed: !!stepData.comments,
            ...entityReference,
          },
          update: {
            comments: stepData.comments,
            stepId: Number(stepData.stepId),
            choice: stepData.choice ?? undefined,
            resume: stepData.resume ?? undefined,
            dateResume,
            file:
              stepData.file && stepData.file.filename
                ? stepData.file.filename
                : undefined,
            fileTwo:
              stepData.fileTwo && stepData.fileTwo.filename
                ? stepData.fileTwo.filename
                : undefined,
            fileThree:
              stepData.fileThree && stepData.fileThree.filename
                ? stepData.fileThree.filename
                : undefined,
            fileFour:
              stepData.fileFour && stepData.fileFour.filename
                ? stepData.fileFour.filename
                : undefined,
            fileFive:
              stepData.fileFive && stepData.fileFive.filename
                ? stepData.fileFive.filename
                : undefined,
            completed: true,
          },
          where: {
            id: stepData.id ? Number(stepData.id) : 0,
          },
        });

        if (stepData.todos && stepData.todos.length > 0 && !stepData.id) {
          const todos: UpsertTodoDto[] = JSON.parse(stepData.todos.toString());

          await this.todoService.upsertTodoStep({ todos }, entityId, userId);
        }
      }

      return { message: "Datos procesados correctamente" };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getInstanceSteps(entityReference: string, modelType: string) {
    const model = getModelByEntityReference(entityReference);
    const prefix = getPrefixByEntityReference(entityReference);

    const where =
      modelType === ModelType.JudicialProcess
        ? { entityJudicialProcessReference: entityReference }
        : { entitySupervisionReference: entityReference };

    const result = await this.prisma[`${model}`].findFirst({
      where: {
        entityReference,
      },
      include: {
        submodule: {
          include: {
            module: true,
          },
        },
      },
    });

    const instances = await this.prisma.instance.findMany({
      where: {
        OR: [
          {
            isGlobal: true,
            moduleId: result.submodule.module.id,
          },
          {
            isGlobal: false,
            submoduleId: result.submodule.id,
          },
        ],
      },
      include: {
        module: true,
        submodule: true,
        incidences: {
          include: {
            instanceIncidenceData: {
              where: where,
            },
          },
        },
        steps: {
          include: {
            stepData: {
              where: where,
              select: {
                comments: true,
                resume: true,
                choice: true,
                dateResume: true,
                file: true,
                fileTwo: true,
                fileThree: true,
                fileFour: true,
                fileFive: true,
                completed: true,
                id: true,
                entityId: true,
              },
            },
          },
        },
      },
    });

    if (prefix === Entities.SNF) {
      return instances
        .filter(
          (instance) =>
            instance.name === "Etapa inspectiva" ||
            instance.name === "Etapa sancionadora",
        )
        .reverse();
    }

    return instances;
  }

  async exportDocument(fileName: string) {
    const filePath = path.join(process.cwd(), "upload", fileName);

    if (!fs.existsSync(filePath)) {
      throw new BadRequestException("El archivo no existe");
    }

    return fs.readFileSync(filePath);
  }
}
