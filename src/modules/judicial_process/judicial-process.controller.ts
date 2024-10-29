import { Body, Controller, Get, Patch, Post, Query } from "@nestjs/common";
import { CreateJudicialProcessDto } from "./dto/create-judicial-process.dto";
import { JudicialProcessService } from "./judicial-process.service";
import { EditJudicialProcessDto } from "./dto/edit-judicial-process.dto";
import { ToggleJudicialProcessDto } from "./dto/toggle-judicial-process.dto";

@Controller("judicial_processes")
export class JudicialProcessController {
  constructor(private judicialProcessService: JudicialProcessService) {}

  @Post("create")
  async createJudicialProcess(
    @Body() judicialProcess: CreateJudicialProcessDto,
    @Query("slug") slug: string,
  ) {
    return this.judicialProcessService.createJudicialProcess(
      judicialProcess,
      slug,
    );
  }

  @Patch("edit")
  async editJudicialProcess(@Body() judicialProcess: EditJudicialProcessDto) {
    return this.judicialProcessService.editJudicialProcess(judicialProcess);
  }

  @Patch("toggle")
  async toggleJudicialProcess(
    @Body() judicialProcess: ToggleJudicialProcessDto,
  ) {
    return this.judicialProcessService.toggleJudicialProcess(judicialProcess);
  }

  @Get("")
  async getJudicialProcesses(@Query("slug") slug: string) {
    return this.judicialProcessService.getJudicialProcesses(slug);
  }
}
