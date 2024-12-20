import { Controller, Get, Query } from "@nestjs/common";
import { CejService } from "./cej.service";
import { FilterCejDto } from "./dto/filter-cej.dto";

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
}
