import { Inject, Injectable, Scope } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { UpsertRoleDto } from "./dto/create-role.dto";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { AssignRoleDto } from "./dto/assign-role.dto";
import { CustomPaginationService } from "../custom_pagination/custom_pagination.service";
import { EntityReferenceModel } from "../../common/utils/entity_reference_mapping";
import { FilterCustomPaginationDto } from "../custom_pagination/dto/fiter-custom-pagination.dto";

@Injectable({ scope: Scope.REQUEST })
export class RolesService {
  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async upsertRole(role: UpsertRoleDto): Promise<any> {
    return this.prisma.role.upsert({
      create: {
        name: role.name,
        description: role.description,
        title: role.title,
      },
      update: {
        name: role.name,
        description: role.description,
        title: role.title,
      },
      where: {
        id: role.id ?? 0,
      },
    });
  }

  async assignRole(assign: AssignRoleDto): Promise<any> {
    return this.prisma.userRole.create({
      data: {
        ...assign,
      },
    });
  }

  async getRoles(): Promise<any> {
    return this.prisma.role.findMany();
  }

  async getRolesFilter(filter: FilterCustomPaginationDto): Promise<any> {
    return CustomPaginationService._getPaginationModel(
      this.prisma,
      EntityReferenceModel.Role,
      {
        page: filter.page,
        pageSize: filter.pageSize,
      },
    );
  }
}
