import { Body, Controller, Get, Patch, Post, Query } from "@nestjs/common";
import { MasterService } from "./master.service";
import { UpsertMasterDto } from "./dto/create-master.dto";
import { CreateMasterOptionDto } from "./dto/create-master-option.dto";
import { EditMasterOptionDto } from "./dto/edit-master-option.dto";
import { ToggleMasterOptionDto } from "./dto/toggle-master-option.dto";
import { AutocompleteFilterDto } from "./dto/autocomplete-filter.dto";
import { FilterMasterReportDto } from "./dto/filter-master-report.dto";

@Controller("masters")
export class MasterController {
  constructor(private masterService: MasterService) {}

  @Get("")
  async getMasters() {
    return this.masterService.getMasters();
  }

  @Get("options")
  async getMasterOptions(@Query("id") id: string) {
    return this.masterService.getMasterOptions(Number(id));
  }

  @Get("report")
  async getMasterBySlugWithOptions(@Query() filter: FilterMasterReportDto) {
    return this.masterService.getMasterBySlugWithOptions(filter);
  }

  @Get("options/autocomplete")
  async getOptionsForAutocompletes(@Query() filter: AutocompleteFilterDto) {
    return this.masterService.getOptionsForAutocompletes(filter);
  }

  @Post("upsert")
  async upsertMaster(@Body() master: UpsertMasterDto) {
    return this.masterService.upsertMaster(master);
  }

  @Post("create/option")
  async createMasterOption(@Body() masterOption: CreateMasterOptionDto) {
    return this.masterService.createMasterOption(masterOption);
  }

  @Patch("edit/option")
  async editMasterOption(@Body() masterOption: EditMasterOptionDto) {
    return this.masterService.editMasterOption(masterOption);
  }

  @Patch("toggle/option")
  async toggleMasterOption(@Body() masterOption: ToggleMasterOptionDto) {
    return this.masterService.toggleMasterOption(masterOption);
  }

  @Get("option")
  async getMasterOption(@Query("id") id: string) {
    return this.masterService.getMasterOption(Number(id));
  }
}
