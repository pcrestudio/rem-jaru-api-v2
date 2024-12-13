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

    return this.prisma.$extended.judicialProcess.create({
      data: {
        fileCode: judicialProcess.fileCode,
        demanded: judicialProcess.demanded,
        plaintiff: judicialProcess.plaintiff,
        coDefendant: judicialProcess.coDefendant,
        controversialMatter: judicialProcess.controversialMatter,
        projectId: judicialProcess.projectId,
        cargoStudioId: judicialProcess.cargoStudioId,
        submoduleId: submodule.id,
      },
    });
  }

  async editJudicialProcess(judicialProcess: EditJudicialProcessDto) {
    if (!judicialProcess.id) {
      throw new BadRequestException(
        "Debe ingresar un ID correspondiente, para la edición",
      );
    }

    return this.prisma.judicialProcess.update({
      data: {
        fileCode: judicialProcess.fileCode,
        demanded: judicialProcess.demanded,
        plaintiff: judicialProcess.plaintiff,
        coDefendant: judicialProcess.coDefendant,
        controversialMatter: judicialProcess.controversialMatter,
        projectId: judicialProcess.projectId,
        cargoStudioId: judicialProcess.cargoStudioId,
      },
      where: {
        id: judicialProcess.id,
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

    return this.prisma.judicialProcess.findMany({
      where: {
        submoduleId: submodule?.id,
        ...(orConditions ? { OR: orConditions } : {}),
      },
    });
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
}
