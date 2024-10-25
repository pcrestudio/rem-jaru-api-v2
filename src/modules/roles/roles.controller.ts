import { Body, Controller, Get, Post } from "@nestjs/common";
import { CreateRoleDto } from "./dto/create-role.dto";
import { RolesService } from "./roles.service";
import { AssignRoleDto } from "./dto/assign-role.dto";

@Controller("roles")
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post("create")
  async create(@Body() role: CreateRoleDto) {
    return this.rolesService.createRole(role);
  }

  @Post("assign")
  async assignRole(@Body() assign: AssignRoleDto): Promise<any> {
    return this.rolesService.assignRole(assign);
  }

  @Get("")
  async getRoles() {
    return this.rolesService.getRoles();
  }
}
