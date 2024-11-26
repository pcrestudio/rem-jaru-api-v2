import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import { CreateJudicialProcessDto } from "./dto/create-judicial-process.dto";
import { JudicialProcessService } from "./judicial-process.service";
import { EditJudicialProcessDto } from "./dto/edit-judicial-process.dto";
import { ToggleJudicialProcessDto } from "./dto/toggle-judicial-process.dto";
import { Response } from "express";

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

  @Get("/:id")
  async getJudicialProcess(@Param("id") id: string) {
    return this.judicialProcessService.getJudicialProcess(Number(id));
  }

  @Get("export/word")
  async exportWord(
    @Query("entityReference") entityReference: string,
    @Res() res: Response,
  ) {
    const document = this.judicialProcessService.exportWord(entityReference);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=documento_generado.docx",
    );

    return res.send(document);
  }
}
