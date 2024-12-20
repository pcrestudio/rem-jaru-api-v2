import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { FilterCejDto } from "./dto/filter-cej.dto";

@Injectable()
export class CejService {
  constructor(private prisma: PrismaService) {}

  async getDossierDetail(filter: FilterCejDto) {
    const dossier = await this.prisma.cEJ_Expedientes.findFirst({
      where: {
        expedientePJ: filter.fileCode,
      },
      include: {
        detalleactuaciones: true,
      },
    });

    const { message, updated } = this.checkDateMessage(dossier.updated_at);

    return {
      ...dossier,
      message: message,
      updated: updated,
      alternativeMessage: `Total de actuaciones: ${dossier.detalleactuaciones.length}`,
    };
  }

  async getActuacionesCEJ(filter: FilterCejDto) {
    const cejExpediente = await this.prisma.cEJ_Expedientes.findFirst({
      where: {
        expedientePJ: filter.fileCode,
      },
    });

    const page = Number(filter.page) || 1;
    const pageSize = Number(filter.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const [results, total] = await this.prisma.$transaction([
      this.prisma.cEJ_ExpedientesActuaciones.findMany({
        where: {
          idExpediente: cejExpediente.idExpediente,
        },
        skip,
        take: pageSize,
      }),
      this.prisma.cEJ_ExpedientesActuaciones.count({
        where: {
          idExpediente: cejExpediente.idExpediente,
        },
      }),
    ]);

    return {
      results,
      dossier: cejExpediente,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  private checkDateMessage(stored: Date): {
    message: string;
    updated: boolean;
  } {
    const now = new Date();

    const isToday =
      stored.getFullYear() === now.getFullYear() &&
      stored.getMonth() === now.getMonth() &&
      stored.getDate() === now.getDate();

    return {
      message: isToday
        ? "La información fue actualizada el día de hoy."
        : "No se han registrado actualizaciones recientes.",
      updated: isToday,
    };
  }
}
