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

  async getModules(isActive: string) {
    let where = {};

    if (Boolean(isActive)) {
      where = { isActive: Boolean(isActive) };
    }

    return this.prisma.module.findMany({
      where,
    });
  }

  async getSettingsModules() {
    const modules = await this.prisma.module.findMany({
      where: { isActive: true },
      include: {
        Submodule: {
          include: {
            GlobalAttribute: true, // Incluir los atributos globales de cada submódulo
          },
        },
      },
    });

    const orderedResult: Record<string, any> = {};

    // Primero agregamos los módulos principales
    modules.forEach((module) => {
      orderedResult[module.name] = {
        id: module.id,
        name: module.name,
        slug: module.slug,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
        isActive: module.isActive,
        order: module.order,
        submodules: module.Submodule.map((submodule) => ({
          id: submodule.id,
          name: submodule.name,
          slug: submodule.slug,
          createdAt: submodule.createdAt,
          updatedAt: submodule.updatedAt,
          isActive: submodule.isActive,
          order: submodule.order,
        })),
        globalAttributes: [],
      };
    });

    // Luego agregamos los submódulos con atributos globales al final
    modules.forEach((module) => {
      module.Submodule.forEach((submodule) => {
        if (submodule.GlobalAttribute.length > 0) {
          orderedResult[submodule.name] = {
            id: submodule.id,
            name: submodule.name,
            slug: submodule.slug,
            createdAt: submodule.createdAt,
            updatedAt: submodule.updatedAt,
            isActive: submodule.isActive,
            order: submodule.order,
            submodules: [], // No tiene submódulos porque es un submódulo
            globalAttributes: submodule.GlobalAttribute,
          };
        }
      });
    });

    return orderedResult;
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

  async getSubmodulesByName(modelName: string) {
    const module_id = await this.prisma.module.findFirst({
      where: {
        name: modelName,
      },
    });

    return this.prisma.submodule.findMany({
      where: {
        moduleId: module_id?.id,
        isActive: true,
        module: {
          isActive: true,
        },
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
