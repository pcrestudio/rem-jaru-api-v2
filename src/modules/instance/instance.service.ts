import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { UpsertInstanceDto } from "./dto/upsert-instance.dto";
import { UpsertInstanceStepDto } from "./dto/upsert-instance-step.dto";
import { UpsertInstanceStepDataDto } from "./dto/upsert-instance-stepdata.dto";

@Injectable()
export class InstanceService {
  constructor(private prisma: PrismaService) {}

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

  async upsertInstanceStepData(instanceStepData: UpsertInstanceStepDataDto) {
    try {
      for (const stepData of instanceStepData.stepData) {
        if (stepData.comments === undefined) continue;

        await this.prisma.$extended.stepData.upsert({
          create: {
            comments: stepData.comments,
            stepId: stepData.stepId,
            file: "",
            entityReference: stepData.entityReference,
            completed: true,
          },
          update: {
            comments: stepData.comments,
            stepId: stepData.stepId,
            entityReference: stepData.entityReference,
            completed: true,
          },
          where: {
            id: stepData.id ?? 0,
          },
        });
      }

      return "added";
    } catch (error) {
      throw new InternalServerErrorException(error);
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
              },
            },
          },
        },
      },
    });
  }
}
