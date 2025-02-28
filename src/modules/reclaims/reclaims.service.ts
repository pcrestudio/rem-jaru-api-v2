import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { UpsertReclaimDto } from "./dto/upsert-reclaim.dto";
import { ModelType } from "@prisma/client";
import { CustomPaginationService } from "../custom_pagination/custom_pagination.service";
import { EntityReferenceModel } from "../../common/utils/entity_reference_mapping";
import { FilterReclaimDto } from "./dto/filter-reclaim.dto";
import { MailService } from "../../shared/mail/mail.service";
import { ConfigService } from "@nestjs/config";
import reclaimsTemplate from "./templates/reclaims.tpl";
import { UtilsService } from "../../utils/utils.service";

@Injectable()
export class ReclaimsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  upsert(
    reclaims: UpsertReclaimDto[],
    entityReference: string,
    modelType: string,
  ) {
    try {
      const additionalPayload =
        modelType === ModelType.JudicialProcess
          ? { entityJudicialProcessReference: entityReference }
          : { entitySupervisionReference: entityReference };

      this.prisma.$transaction(async (tx) => {
        for (const reclaim of reclaims) {
          const judicialProcess = await this.prisma.judicialProcess.findFirst({
            where: {
              entityReference,
            },
          });

          await tx.reclaim.upsert({
            create: {
              amount: Number(reclaim.amount),
              contingencyLevel: reclaim.contingencyLevel,
              contingencyPercentage: Number(reclaim.contingencyPercentage),
              provisionAmount: Number(reclaim.provisionAmount),
              provisionContingency: Number(reclaim.provisionContingency),
              posibleAmount: Number(reclaim.posibleAmount),
              remoteAmount: Number(reclaim.remoteAmount),
              concept: reclaim.concept,
              ...additionalPayload,
            },
            update: {
              amount: Number(reclaim.amount),
              concept: reclaim.concept,
              contingencyLevel: reclaim.contingencyLevel,
              contingencyPercentage: Number(reclaim.contingencyPercentage),
              provisionAmount: Number(reclaim.provisionAmount),
              posibleAmount: Number(reclaim.posibleAmount),
              remoteAmount: Number(reclaim.remoteAmount),
              provisionContingency: Number(reclaim.provisionContingency),
            },
            where: {
              reclaimId: reclaim.reclaimId ?? 0,
            },
          });
        }
      });

      return "upsert";
    } catch (error) {
      throw new InternalServerErrorException({
        message: `Failed to upsert a reclaim`,
        error: error.message,
      });
    }
  }

  getReclaims(filter: FilterReclaimDto) {
    const whereFields =
      filter.modelType === ModelType.Supervision
        ? { entitySupervisionReference: filter.entityReference }
        : { entityJudicialProcessReference: filter.entityReference };

    return CustomPaginationService._getPaginationModel(
      this.prisma,
      EntityReferenceModel.Reclaim,
      {
        ...filter,
        whereFields: whereFields,
      },
      [],
    );
  }
}
