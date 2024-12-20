import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { FilterCejDto } from "./dto/filter-cej.dto";
import { CustomPaginationService } from "../custom_pagination/custom_pagination.service";
import { Response } from "express";
import * as path from "path";
import * as fs from "fs";

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

    return CustomPaginationService._getPaginationModel(
      this.prisma,
      "cEJ_ExpedientesActuaciones",
      {
        whereFields: {
          idExpediente: cejExpediente.idExpediente,
        },
        page: filter.page,
        pageSize: filter.pageSize,
      },
    );
  }

  async exportDossier(fileName: string, res: Response) {
    const basePath = path.resolve(process.env.RESOLUCIONES);

    const filePath = path.join(basePath, fileName);

    if (!fs.existsSync(filePath)) {
      throw new Error("El archivo no existe");
    }

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error al enviar el archivo:", err);
        res.status(500).send("Error al descargar el archivo.");
      }
    });
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
