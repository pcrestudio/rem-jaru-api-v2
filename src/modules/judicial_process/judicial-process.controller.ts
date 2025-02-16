import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { CreateJudicialProcessDto } from "./dto/create-judicial-process.dto";
import { JudicialProcessService } from "./judicial-process.service";
import { EditJudicialProcessDto } from "./dto/edit-judicial-process.dto";
import { ToggleJudicialProcessDto } from "./dto/toggle-judicial-process.dto";
import { Response } from "express";
import { FilterJudicialProcessDto } from "./dto/filter-judicial-process.dto";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { multerConfig } from "../../config/multer.config";

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
  @UseInterceptors(AnyFilesInterceptor(multerConfig))
  async editJudicialProcess(
    @Body() judicialProcess: EditJudicialProcessDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.judicialProcessService.editJudicialProcess(
      judicialProcess,
      files,
    );
  }

  @Patch("toggle")
  async toggleJudicialProcess(
    @Body() judicialProcess: ToggleJudicialProcessDto,
  ) {
    return this.judicialProcessService.toggleJudicialProcess(judicialProcess);
  }

  @Get("")
  async getJudicialProcesses(@Query() filter: FilterJudicialProcessDto) {
    return this.judicialProcessService.getJudicialProcesses(filter);
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
    const document =
      await this.judicialProcessService.exportWord(entityReference);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    res.setHeader("Content-Disposition", `attachment; filename=document.docx`);

    return res.end(document);
  }

  @Get("export/excel")
  async exportExcel(@Res() res: Response) {
    const document = await this.judicialProcessService.exportExcel();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

    return res.send(document);
  }
}
