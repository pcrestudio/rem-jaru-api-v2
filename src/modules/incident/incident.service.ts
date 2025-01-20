import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { UpsertIncidentDto } from "./dto/upsert-incident.dto";
import { UpsertIncidentDataDto } from "./dto/upsert-incident-data.dto";

@Injectable()
export class IncidentService {
  constructor(private readonly prisma: PrismaService) {}

  async bulkIncidents(incidents: UpsertIncidentDto[]) {
    try {
      this.prisma.$transaction(async (tx) => {
        for (const incident of incidents) {
          await tx.instanceIncident.create({
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
          await tx.instanceIncidentData.upsert({
            create: {
              fileCode: incident.fileCode,
              comment: incident.comment,
              instanceIncidentId: incident.instanceIncidentId,
              entityJudicialProcessReference: incident.entityReference,
              headquarters: incident.headquarters,
            },
            update: {
              fileCode: incident.fileCode,
              comment: incident.comment,
              instanceIncidentId: incident.instanceIncidentId,
              headquarters: incident.headquarters,
              entityJudicialProcessReference: incident.entityReference,
            },
            where: {
              id: incident?.id ?? 0,
              instanceIncidentId: incident?.instanceIncidentId,
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
