import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { SupervisionService } from "./supervision.service";
import { CreateSupervisionDto } from "./dto/create-supervision.dto";
import { FilterSupervisionDto } from "./dto/filter-supervision.dto";
import { EditSupervisionDto } from "./dto/edit-supervision.dto";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { multerConfig } from "../../config/multer.config";
import { Response } from "express";
import { ToggleJudicialProcessDto } from "../judicial_process/dto/toggle-judicial-process.dto";

@Controller("supervisions")
export class SupervisionController {
  constructor(private supervisionService: SupervisionService) {}

  @Post("create")
  async createJudicialProcess(
    @Body() supervision: CreateSupervisionDto,
    @Query("slug") slug: string,
  ) {
    return this.supervisionService.createSupervision(supervision, slug);
  }

  @Patch("edit")
  @UseInterceptors(AnyFilesInterceptor(multerConfig))
  async editSupervision(
    @Body() supervision: EditSupervisionDto,
    @Query("slug") slug: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.supervisionService.editSupervision(supervision, slug, files);
  }

  @Get("/:id")
  async getJudicialProcess(@Param("id") id: string) {
    return this.supervisionService.getSupervision(Number(id));
  }

  @Get("")
  async getSupervisionsBySlug(@Query() filter: FilterSupervisionDto) {
    return this.supervisionService.getSupervisionsBySlug(filter);
  }

  @Get("export/word")
  async exportWord(
    @Query("entityReference") entityReference: string,
    @Res() res: Response,
  ) {
    const document = await this.supervisionService.exportWord(entityReference);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    res.setHeader("Content-Disposition", `attachment; filename=document.docx`);

    return res.end(document);
  }

  @Get("export/excel")
  async exportExcel(@Res() res: Response) {
    const document = await this.supervisionService.exportExcel();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

    return res.send(document);
  }

  @Patch("toggle")
  async toggleSupervision(@Body() supervision: ToggleJudicialProcessDto) {
    return this.supervisionService.toggleSupervision(supervision);
  }
}
