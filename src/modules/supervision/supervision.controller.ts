import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { SupervisionService } from "./supervision.service";
import { CreateSupervisionDto } from "./dto/create-supervision.dto";

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

  @Get("/:id")
  async getJudicialProcess(@Param("id") id: string) {
    return this.supervisionService.getSupervision(Number(id));
  }

  @Get("")
  async getSupervisionsBySlug(@Query("slug") slug: string) {
    return this.supervisionService.getSupervisionsBySlug(slug);
  }
}
