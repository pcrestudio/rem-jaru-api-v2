import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { CreateModuleDto } from "./dto/create-module.dto";
import { ModuleService } from "./module.service";
import { CreateSubmoduleDto } from "./dto/create-submodule.dto";

@Controller("modules")
export class ModuleController {
  constructor(private moduleService: ModuleService) {}

  @Post("create")
  async createModule(@Body() module: CreateModuleDto) {
    return this.moduleService.createModule(module);
  }

  @Post("submodule/create")
  async createSubmodule(@Body() submodule: CreateSubmoduleDto) {
    return this.moduleService.createSubmodule(submodule);
  }

  @Get("")
  async getModules() {
    return this.moduleService.getModules();
  }

  @Get("submodules")
  async getSubmodules(@Query("slug") slug: string) {
    return this.moduleService.getSubmodules(slug);
  }
}
