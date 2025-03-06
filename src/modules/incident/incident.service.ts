import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { UpsertIncidentDto } from "./dto/upsert-incident.dto";
import { UpsertIncidentDataDto } from "./dto/upsert-incident-data.dto";
import { FilterIncidenceDto } from "./dto/filter-incidence.dto";
import {
  EntityReferenceModel,
  ModelType,
} from "../../common/utils/entity_reference_mapping";
import { CustomPaginationService } from "../custom_pagination/custom_pagination.service";
import { searchableFields } from "../../config/submodule_searchableFields";

@Injectable()
export class IncidentService {
  constructor(private readonly prisma: PrismaService) {}

  getIncidences(filter: FilterIncidenceDto) {
    const where =
      filter.modelType === ModelType.JudicialProcess
        ? { entityJudicialProcessReference: filter.entityReference }
        : { entitySupervisionReference: filter.entityReference };

    return CustomPaginationService._getPaginationModel(
      this.prisma,
      EntityReferenceModel.Incidence,
      {
        page: filter.page,
        pageSize: filter.pageSize,
        whereFields: {
          ...where,
        },
        search: filter.search,
      },
      searchableFields,
    );
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

    try {
      return this.prisma.incidence.create({
        data: {
          name: incidence.name,
          ...createCondition,
        },
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

  async getIncidenceData() {}
}
