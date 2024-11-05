import { Body, Controller, Get, Patch, Post, Query } from "@nestjs/common";
import { MasterService } from "./master.service";
import { CreateMasterDto } from "./dto/create-master.dto";
import { CreateMasterOptionDto } from "./dto/create-master-option.dto";
import { EditMasterOptionDto } from "./dto/edit-master-option.dto";

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

  @Post("create/option")
  async createMasterOption(@Body() masterOption: CreateMasterOptionDto) {
    return this.masterService.createMasterOption(masterOption);
  }

  @Patch("edit/option")
  async editMasterOption(@Body() masterOption: EditMasterOptionDto) {
    return this.masterService.editMasterOption(masterOption);
  }
}
