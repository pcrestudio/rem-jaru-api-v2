import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateModuleDto } from "./dto/create-module.dto";
import { CreateSubmoduleDto } from "./dto/create-submodule.dto";

@Injectable()
export class ModuleService {
  constructor(private prisma: PrismaService) {}

  async createModule(module: CreateModuleDto) {
    return this.prisma.module.create({
      data: {
        ...module,
      },
    });
  }

  async getModules() {
    return this.prisma.module.findMany({
      where: {
        isActive: true,
      },
    });
  }

  async createSubmodule(submodule: CreateSubmoduleDto) {
    return this.prisma.submodule.create({
      data: {
        ...submodule,
        moduleId: submodule.moduleId,
      },
    });
  }

  async getSubmodulesBySlug(slug: string) {
    const module_id = await this.prisma.module.findFirst({
      where: {
        slug: slug,
      },
    });

    return this.prisma.submodule.findMany({
      where: {
        moduleId: module_id.id,
        isActive: true,
      },
    });
  }

  async getSubmodulesById(id: number) {
    const module_id = await this.prisma.module.findFirst({
      where: {
        id: id ?? 0,
      },
    });

    return this.prisma.submodule.findMany({
      where: {
        moduleId: module_id?.id,
        isActive: true,
      },
    });
  }

  async getSubmodules() {
    return this.prisma.submodule.findMany({
      where: {
        isActive: true,
      },
    });
  }
}
