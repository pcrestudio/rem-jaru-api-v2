import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { CreateJudicialProcessDto } from "./dto/create-judicial-process.dto";
import { EditJudicialProcessDto } from "./dto/edit-judicial-process.dto";
import { ToggleJudicialProcessDto } from "./dto/toggle-judicial-process.dto";
import { Document, HeadingLevel, Packer, Paragraph } from "docx";
import * as fs from "node:fs";
import { angloDocHeader } from "../../common/utils/anglo_doc_header";
import { FilterJudicialProcessDto } from "./dto/filter-judicial-process.dto";
import { CustomPaginationService } from "../custom_pagination/custom_pagination.service";
import { ExportablesService } from "../exportables/exportables.service";
import { EntityReferenceModel } from "../../common/utils/entity_reference_mapping";

@Injectable()
export class JudicialProcessService {
  constructor(private prisma: PrismaService) {}

  async createJudicialProcess(
    judicialProcess: CreateJudicialProcessDto,
    slug: string,
  ) {
    const submodule = await this.prisma.submodule.findFirst({
      where: {
        slug,
      },
    });

    const { result } = await this.prisma.$extended.judicialProcess.create({
      data: {
        fileCode: judicialProcess.fileCode,
        demanded: judicialProcess.demanded,
        plaintiff: judicialProcess.plaintiff,
        coDefendant: judicialProcess.coDefendant,
        controversialMatter: judicialProcess.controversialMatter,
        projectId: judicialProcess.projectId,
        cargoStudioId: judicialProcess.cargoStudioId,
        responsibleId: judicialProcess.responsibleId,
        secondaryResponsibleId: judicialProcess.secondaryResponsibleId,
        submoduleId: submodule.id,
      },
    });

    if (result) {
      await this.prisma.cEJ_Expedientes.create({
        data: {
          expedientePJ: result.fileCode,
          activo: "S",
        },
      });

      return result;
    }

    throw new InternalServerErrorException({
      message: `Error creating judicial process`,
    });
  }

  async editJudicialProcess(
    judicialProcess: EditJudicialProcessDto,
    files: Express.Multer.File[],
  ) {
    if (!judicialProcess.id) {
      throw new BadRequestException(
        "Debe ingresar un ID correspondiente, para la edición",
      );
    }

    let guaranteeLetter: string = "";

    console.log(judicialProcess.guaranteeLetter);

    if (files && files.length > 0) {
      const file = files.find((f) => f.fieldname === "guaranteeLetter");
      guaranteeLetter = file ? file.filename : "";
    } else if (judicialProcess.guaranteeLetter) {
      guaranteeLetter = judicialProcess.guaranteeLetter;
    }

    return this.prisma.judicialProcess.update({
      data: {
        fileCode: judicialProcess.fileCode,
        demanded: judicialProcess.demanded,
        plaintiff: judicialProcess.plaintiff,
        coDefendant: judicialProcess.coDefendant,
        controversialMatter: judicialProcess.controversialMatter,
        isProvisional: judicialProcess.isProvisional === "false" ? false : true,
        projectId: Number(judicialProcess.projectId),
        cargoStudioId: Number(judicialProcess.cargoStudioId),
        responsibleId: Number(judicialProcess.responsibleId),
        guaranteeLetter,
        secondaryResponsibleId: Number(judicialProcess.secondaryResponsibleId),
      },
      where: {
        id: Number(judicialProcess.id),
      },
    });
  }

  async toggleJudicialProcess(judicialProcess: ToggleJudicialProcessDto) {
    if (!judicialProcess.id) {
      throw new BadRequestException(
        "Debe ingresar un ID correspondiente, para la activación o desactivación del expediente.",
      );
    }

    return this.prisma.judicialProcess.update({
      data: {
        isActive: !judicialProcess.isActive,
      },
      where: {
        id: judicialProcess.id,
      },
    });
  }

  async getJudicialProcesses(filter: FilterJudicialProcessDto) {
    const submodule = await this.prisma.submodule.findFirst({
      where: {
        slug: filter.slug,
      },
    });

    const searchableFields = [
      "fileCode",
      "demanded",
      "plaintiff",
      "coDefendant",
    ];

    const orConditions = filter.search
      ? searchableFields.map((field) => ({
          [field]: {
            contains: filter.search,
          },
        }))
      : undefined;

    const whereFields = {
      submoduleId: submodule?.id,
      ...(orConditions ? { OR: orConditions } : {}),
    };

    return CustomPaginationService._getPaginationModel(
      this.prisma,
      EntityReferenceModel.JudicialProcess,
      {
        page: filter.page,
        pageSize: filter.pageSize,
        whereFields,
        orConditions,
        includeConditions: {
          responsible: true,
          secondaryResponsible: true,
          project: true,
          studio: true,
        },
      },
    );
  }

  async getJudicialProcess(id: number) {
    return this.prisma.judicialProcess.findFirst({
      where: {
        id,
      },
    });
  }

  async exportWord(entityReference?: string) {
    try {
      const bufferLogo = fs.readFileSync(`${process.cwd()}/public/img/rem.png`);

      const doc = new Document({
        sections: [
          {
            headers: {
              default: angloDocHeader(bufferLogo),
            },
            children: [],
          },
          {
            children: [
              new Paragraph({ text: "Yes", heading: HeadingLevel.HEADING_1 }),
            ],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);
      fs.writeFileSync(`${entityReference}.docx`, buffer);

      return buffer;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async exportExcel() {
    const judicialProcesses = await this.prisma.judicialProcess.findMany({
      include: {
        responsible: true,
        studio: true,
        project: true,
      },
    });

    console.log(judicialProcesses);

    const headers = [
      { key: "fileCode", header: "Código de expediente" },
      { key: "demanded", header: "Demandante" },
      { key: "plaintiff", header: "Demandado" },
      { key: "coDefendant", header: "Co-demandado" },
      { key: "responsible.displayName", header: "Responsable" },
      { key: "project.name", header: "Proyecto" },
      { key: "studio.name", header: "Estudio" },
    ];

    const flattenedProcesses = judicialProcesses.map((process) =>
      headers.reduce((acc, { key }) => {
        acc[key] = this.getNestedValue(process, key);
        return acc;
      }, {}),
    );

    try {
      return ExportablesService.generateExcel(headers, flattenedProcesses);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  private getNestedValue(obj: any, path: string) {
    return path.split(".").reduce((acc, key) => (acc ? acc[key] : null), obj);
  }
}
