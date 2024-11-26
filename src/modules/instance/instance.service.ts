import { Injectable } from "@nestjs/common";
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
    return this.prisma.$extended.stepData.upsert({
      create: {
        comments: instanceStepData.comments,
        stepId: instanceStepData.stepId,
        file: "",
        entityReference: instanceStepData.entityReference,
        completed: true,
      },
      update: {
        comments: instanceStepData.comments,
        stepId: instanceStepData.stepId,
        entityReference: instanceStepData.entityReference,
        completed: true,
      },
      where: {
        id: instanceStepData.id ?? 0,
      },
    });
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
            },
          },
        },
      },
    });
  }
}
