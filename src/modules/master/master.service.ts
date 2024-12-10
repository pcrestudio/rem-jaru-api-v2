import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { UpsertMasterDto } from "./dto/create-master.dto";
import { CreateMasterOptionDto } from "./dto/create-master-option.dto";
import { EditMasterOptionDto } from "./dto/edit-master-option.dto";
import { ToggleMasterOptionDto } from "./dto/toggle-master-option.dto";

@Injectable()
export class MasterService {
  constructor(private prisma: PrismaService) {}

  async getMasters() {
    const masters = await this.prisma.master.findMany({
      where: {
        isActive: true,
      },
      include: {
        module: true,
      },
    });

    return masters.reduce(
      (acc, master) => {
        const category = master.module?.name || "General";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(master);
        return acc;
      },
      {} as Record<string, typeof masters>,
    );
  }

  async getMasterOptions(id: number) {
    return this.prisma.masterOption.findMany({
      where: {
        masterId: id,
      },
    });
  }

  async getOptionsForAutocompletes() {
    return this.prisma.master.findMany({
      where: {
        isActive: true,
      },
      select: {
        slug: true,
        masterOption: {
          where: {
            isActive: true,
          },
        },
      },
    });
  }

  async upsertMaster(master: UpsertMasterDto) {
    try {
      await this.prisma.master.upsert({
        create: {
          name: master.name,
          slug: master.slug,
          moduleId: master.moduleId ? master.moduleId : null,
        },
        update: {
          name: master.name,
          slug: master.slug,
          moduleId: master.moduleId ? master.moduleId : null,
        },
        where: {
          id: master.id ?? 0,
        },
      });

      return "master created";
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createMasterOption(masterOption: CreateMasterOptionDto) {
    const master = await this.prisma.master.findUnique({
      where: {
        id: masterOption.masterId,
      },
    });

    return this.prisma.masterOption.create({
      data: {
        name: masterOption.name,
        slug: masterOption.slug,
        masterId: master.id,
      },
    });
  }

  async editMasterOption(masterOption: EditMasterOptionDto) {
    const master = await this.prisma.master.findUnique({
      where: {
        id: masterOption.masterId,
      },
    });

    return this.prisma.masterOption.update({
      data: {
        name: masterOption.name,
        slug: masterOption.slug,
        masterId: master.id,
      },
      where: {
        id: masterOption.id,
      },
    });
  }

  async toggleMasterOption(masterOption: ToggleMasterOptionDto) {
    return this.prisma.masterOption.update({
      data: {
        isActive: !masterOption.isActive,
      },
      where: {
        id: masterOption.id,
      },
    });
  }
}
