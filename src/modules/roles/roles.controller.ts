import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { UpsertRoleDto } from "./dto/create-role.dto";
import { RolesService } from "./roles.service";
import { AssignRoleDto } from "./dto/assign-role.dto";
import { FilterCustomPaginationDto } from "../custom_pagination/dto/fiter-custom-pagination.dto";

@Controller("roles")
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post("upsert")
  async upsertRole(@Body() role: UpsertRoleDto) {
    return this.rolesService.upsertRole(role);
  }

  @Post("assign")
  async assignRole(@Body() assign: AssignRoleDto): Promise<any> {
    return this.rolesService.assignRole(assign);
  }

  @Get("")
  async getRoles() {
    return this.rolesService.getRoles();
  }

  @Get("filter")
  async getRolesFilter(@Query() filter: FilterCustomPaginationDto) {
    return this.rolesService.getRolesFilter(filter);
  }
}
