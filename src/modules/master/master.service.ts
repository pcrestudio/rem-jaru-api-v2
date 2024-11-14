import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateMasterDto } from "./dto/create-master.dto";
import { CreateMasterOptionDto } from "./dto/create-master-option.dto";
import { EditMasterOptionDto } from "./dto/edit-master-option.dto";
import { ToggleMasterOptionDto } from "./dto/toggle-master-option.dto";

@Injectable()
export class MasterService {
  constructor(private prisma: PrismaService) {}

  async getMasters() {
    return this.prisma.master.findMany({
      where: {
        isActive: true,
      },
      include: {
        module: true,
      },
    });
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

  async createMaster(master: CreateMasterDto) {
    return this.prisma.master.create({
      data: {
        ...master,
        moduleId: master.moduleId,
      },
    });
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
