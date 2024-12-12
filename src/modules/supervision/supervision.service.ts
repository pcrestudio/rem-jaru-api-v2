import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { CreateSupervisionDto } from "./dto/create-supervision.dto";

@Injectable()
export class SupervisionService {
  constructor(private prisma: PrismaService) {}

  async createSupervision(supervision: CreateSupervisionDto, slug: string) {
    const submodule = await this.prisma.submodule.findFirst({
      where: {
        slug,
      },
    });

    return this.prisma.$extended.supervision.create({
      data: {
        authorityId: supervision.authorityId,
        situationId: supervision.situationId,
        projectId: supervision.projectId,
        responsibleId: supervision.responsibleId,
        submoduleId: submodule.id,
      },
    });
  }

  async getSupervisionsBySlug(slug: string) {
    const submodule = await this.prisma.submodule.findFirst({
      where: {
        slug,
      },
    });

    return this.prisma.supervision.findMany({
      where: {
        submoduleId: submodule.id,
      },
      include: {
        authority: true,
        project: true,
        responsible: true,
        situation: true,
      },
    });
  }

  async getSupervision(id: number) {
    return this.prisma.supervision.findFirst({
      where: {
        id,
      },
    });
  }
}
