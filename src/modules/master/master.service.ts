import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateMasterDto } from "./dto/create-master.dto";

@Injectable()
export class MasterService {
  constructor(private prisma: PrismaService) {}

  async getMasters() {
    return this.prisma.master.findMany({
      where: {
        isActive: true,
      },
    });
  }

  async getMasterOptions(id: string) {
    const master = await this.prisma.master.findUnique({
      where: {
        id: Number(id),
      },
    });

    return this.prisma.masterOption.findMany({
      where: {
        masterId: master.id,
      },
    });
  }

  async createMaster(master: CreateMasterDto) {
    return this.prisma.master.create({
      data: {
        ...master,
      },
    });
  }
}
