import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { MasterService } from "./master.service";
import { CreateMasterDto } from "./dto/create-master.dto";

@Controller("masters")
export class MasterController {
  constructor(private masterService: MasterService) {}

  @Get("")
  async getMasters() {
    return this.masterService.getMasters();
  }

  @Get("options")
  async getMasterOptions(@Query("id") id: string) {
    return this.masterService.getMasterOptions(id);
  }

  @Post("create")
  async createMaster(@Body() master: CreateMasterDto) {
    return this.masterService.createMaster(master);
  }
}
