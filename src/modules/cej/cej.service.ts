import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { FilterCejDto } from "./dto/filter-cej.dto";
import { CustomPaginationService } from "../custom_pagination/custom_pagination.service";
import { Response } from "express";
import * as path from "path";
import * as fs from "fs";
import { EntityReferenceModel } from "../../common/utils/entity_reference_mapping";

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

    const { message, updated } = this.checkDateMessage(dossier?.updated_at);

    return {
      ...dossier,
      message: message,
      updated: updated,
      alternativeMessage: `Total de actuaciones: ${dossier?.detalleactuaciones ? dossier?.detalleactuaciones.length : 0}`,
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
      EntityReferenceModel.CEJ_ACTUACIONES,
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
    const basePath = process.env.RESOLUCIONES;

    if (!basePath) {
      throw new Error("La variable RESOLUCIONES no está definida.");
    }

    const filePath = path.join(basePath, fileName);

    try {
      if (!fs.existsSync(filePath)) {
        console.warn(`Archivo no encontrado: ${filePath}`);
        return res.status(404).json({ message: "El archivo no existe." });
      }

      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error("Error al enviar el archivo:", err);
          if (!res.headersSent) {
            return res
              .status(500)
              .json({ message: "Error al descargar el archivo." });
          }
        }
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: error.message,
      });
    }
  }

  private checkDateMessage(stored: Date): {
    message: string;
    updated: boolean;
  } {
    const now = new Date();

    const isToday =
      stored?.getFullYear() === now.getFullYear() &&
      stored?.getMonth() === now.getMonth() &&
      stored?.getDate() === now.getDate();

    return {
      message: isToday
        ? "La información fue actualizada el día de hoy."
        : "No se han registrado actualizaciones recientes.",
      updated: isToday,
    };
  }
}
