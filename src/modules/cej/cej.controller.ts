import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
} from "@nestjs/common";
import { CejService } from "./cej.service";
import { FilterCejDto } from "./dto/filter-cej.dto";
import { Response } from "express";

@Controller("cej")
export class CejController {
  constructor(private readonly cejService: CejService) {}

  @Get("detail")
  async getDossierDetail(@Query() filter: FilterCejDto) {
    return this.cejService.getDossierDetail(filter);
  }

  @Get("historical")
  async getActuacionesCEJ(@Query() filter: FilterCejDto) {
    return this.cejService.getActuacionesCEJ(filter);
  }

  @Get("export")
  async exportDossier(
    @Query("fileName") fileName: string,
    @Res() res: Response,
  ) {
    if (!fileName) {
      throw new BadRequestException('El parámetro "fileName" es obligatorio.');
    }

    try {
      this.cejService.exportDossier(fileName, res);
    } catch (error) {
      res.status(404).send(error.message);
    }
  }
}
