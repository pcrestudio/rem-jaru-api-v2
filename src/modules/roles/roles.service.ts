import { Inject, Injectable, Scope } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { AssignRoleDto } from "./dto/assign-role.dto";

@Injectable({ scope: Scope.REQUEST })
export class RolesService {
  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async createRole(role: CreateRoleDto): Promise<any> {
    return this.prisma.role.create({
      data: {
        ...role,
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
}
