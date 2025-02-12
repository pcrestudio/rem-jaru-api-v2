import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { UpsertReclaimDto } from "./dto/upsert-reclaim.dto";
import { ModelType } from "@prisma/client";

@Injectable()
export class ReclaimsService {
  constructor(private readonly prisma: PrismaService) {}

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
          await tx.reclaim.upsert({
            create: {
              amount: Number(reclaim.amount),
              contingencyLevel: reclaim.contingencyLevel,
              contingencyPercentage: Number(reclaim.contingencyPercentage),
              provisionAmount: Number(reclaim.provisionAmount),
              provisionContingency: Number(reclaim.provisionContingency),
              concept: reclaim.concept,
              ...additionalPayload,
            },
            update: {
              amount: Number(reclaim.amount),
              concept: reclaim.concept,
              contingencyLevel: reclaim.contingencyLevel,
              contingencyPercentage: Number(reclaim.contingencyPercentage),
              provisionAmount: Number(reclaim.provisionAmount),
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
}
