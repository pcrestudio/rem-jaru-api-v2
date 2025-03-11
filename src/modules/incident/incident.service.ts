import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { UpsertIncidentDto } from "./dto/upsert-incident.dto";
import { UpsertIncidentDataDto } from "./dto/upsert-incident-data.dto";
import { FilterIncidenceDto } from "./dto/filter-incidence.dto";
import {
  EntityReferenceModel,
  mappingModuleES,
  ModelType,
} from "../../common/utils/entity_reference_mapping";
import { CustomPaginationService } from "../custom_pagination/custom_pagination.service";
import { searchableFields } from "../../config/submodule_searchableFields";
import { FilterIncidenceDataDto } from "../instance/dto/filter-incidence-data.dto";

@Injectable()
export class IncidentService {
  constructor(private readonly prisma: PrismaService) {}

  getIncidences(filter: FilterIncidenceDto) {
    const where =
      filter.modelType === ModelType.JudicialProcess
        ? { entityJudicialProcessReference: filter.entityReference }
        : { entitySupervisionReference: filter.entityReference };

    return this.prisma.incidence.findMany({
      where,
    });
  }

  async bulkIncidents(incidents: UpsertIncidentDto[]) {
    try {
      this.prisma.$transaction(async (tx) => {
        for (const incident of incidents) {
          await tx.incidence.create({
            data: {
              name: incident.name,
            },
          });
        }
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: `Error while bulking incidents`,
        error: error.message,
      });
    }
  }

  async upsertIncidence(incidence: UpsertIncidentDto) {
    const createCondition =
      incidence?.modelType === ModelType.JudicialProcess
        ? { entityJudicialProcessReference: incidence.entityReference }
        : { entitySupervisionReference: incidence.entityReference };
    const moduleSlug = mappingModuleES[incidence?.modelType];

    try {
      return await this.prisma.$transaction(async (tx) => {
        const result = await tx.incidence.create({
          data: {
            name: incidence.name,
            ...createCondition,
          },
        });

        const instances = await tx.instance.findMany({
          where: {
            module: {
              name: moduleSlug,
            },
          },
        });

        for (const instance of instances) {
          await tx.incidenceInstance.create({
            data: {
              instanceId: instance.id,
              incidenceId: Number(result.id),
            },
          });
        }

        return result;
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: `Error while creating incidence`,
        error: error.message,
      });
    }
  }

  async upsertIncidentData(incidentData: UpsertIncidentDataDto[]) {
    try {
      this.prisma.$transaction(async (tx) => {
        for (const incident of incidentData) {
          await tx.incidenceData.upsert({
            create: {
              fileCode: incident.fileCode,
              comment: incident.comment,
              incidentId: incident.instanceIncidentId,
              headquarters: incident.headquarters,
            },
            update: {
              fileCode: incident.fileCode,
              comment: incident.comment,
              incidentId: incident.instanceIncidentId,
              headquarters: incident.headquarters,
            },
            where: {
              id: incident?.id ?? 0,
              incidentId: incident?.instanceIncidentId,
            },
          });
        }
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: `Error while bulking incidents data`,
        error: error.message,
      });
    }
  }

  async upsertIncidenceData(incidenceData: UpsertIncidentDataDto) {
    try {
      return this.prisma.incidenceData.upsert({
        create: {
          headquarters: incidenceData.headquarters,
          comment: incidenceData.comment,
          fileCode: incidenceData.fileCode,
          incidentId: incidenceData.instanceIncidentId,
        },
        update: {
          headquarters: incidenceData.headquarters,
          comment: incidenceData.comment,
          fileCode: incidenceData.fileCode,
          incidentId: incidenceData.instanceIncidentId,
        },
        where: { id: incidenceData.id ? incidenceData.id : 0 },
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: `Error while creating incidence`,
        error: error.message,
      });
    }
  }

  async getIncidenceData(filter: FilterIncidenceDataDto) {
    return this.prisma.incidenceData.findFirst({
      where: {
        incidentId: Number(filter.incidenceId),
      },
      include: {
        incidence: {
          include: {
            incidenceInstance: true,
          },
        },
      },
    });
  }

  async getIncidenceInstances(filter: FilterIncidenceDataDto) {
    const incidenceInstances = await this.prisma.incidenceInstance.findMany({
      where: {
        incidenceId: Number(filter.incidenceId),
      },
      include: {
        instance: {
          include: {
            steps: {
              include: {
                stepData: {
                  where: {
                    incidenceId: Number(filter.incidenceId),
                  },
                },
              },
            },
          },
        },
      },
    });

    return incidenceInstances.map((incidenceInstance) => ({
      ...incidenceInstance.instance,
    }));
  }

  async deleteIncidence(incidenceId: number) {
    return this.prisma.$transaction([
      this.prisma.stepData.deleteMany({
        where: {
          incidenceId: incidenceId,
        },
      }),
      this.prisma.incidenceData.deleteMany({
        where: {
          incidentId: incidenceId,
        },
      }),
      this.prisma.incidenceInstance.deleteMany({
        where: {
          incidenceId: incidenceId,
        },
      }),
      this.prisma.incidence.delete({
        where: {
          id: incidenceId,
        },
      }),
    ]);
  }
}
