import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { UpsertIncidentDto } from "./dto/upsert-incident.dto";
import { UpsertIncidentDataDto } from "./dto/upsert-incident-data.dto";
import { FilterIncidenceDto } from "./dto/filter-incidence.dto";
import { ModelType } from "../../common/utils/entity_reference_mapping";

@Injectable()
export class IncidentService {
  constructor(private readonly prisma: PrismaService) {}

  getIncidences(filter: FilterIncidenceDto) {
    const where =
      filter.modelType === ModelType.JudicialProcess
        ? { entityJudicialProcessReference: filter.entityReference }
        : { entitySupervisionReference: filter.entityReference };

    return this.prisma.incidence.findMany({
      where: where,
    });
  }

  async bulkIncidents(incidents: UpsertIncidentDto[]) {
    try {
      this.prisma.$transaction(async (tx) => {
        for (const incident of incidents) {
          await tx.incidence.create({
            data: {
              name: incident.name,
              instanceId: incident.instanceId,
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
}
