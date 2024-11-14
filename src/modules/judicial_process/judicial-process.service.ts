import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { CreateJudicialProcessDto } from "./dto/create-judicial-process.dto";
import { EditJudicialProcessDto } from "./dto/edit-judicial-process.dto";
import { ToggleJudicialProcessDto } from "./dto/toggle-judicial-process.dto";

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

    return this.prisma.judicialProcess.create({
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

  async getJudicialProcesses(slug: string) {
    const submodule = await this.prisma.submodule.findFirst({
      where: {
        slug,
      },
    });

    return this.prisma.judicialProcess.findMany({
      where: {
        submoduleId: submodule.id,
      },
    });
  }
}
