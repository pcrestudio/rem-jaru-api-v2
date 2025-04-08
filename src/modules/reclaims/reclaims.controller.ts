import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { ReclaimsService } from "./reclaims.service";
import { UpsertReclaimDto } from "./dto/upsert-reclaim.dto";
import { FilterReclaimDto } from "./dto/filter-reclaim.dto";

@Controller("reclaims")
export class ReclaimsController {
  constructor(private readonly reclaims: ReclaimsService) {}

  @Post("upsert")
  upsert(
    @Body() reclaims: UpsertReclaimDto[],
    @Query("entityReference") entityReference: string,
    @Query("modelType") modelType: string,
  ) {
    return this.reclaims.upsert(reclaims, entityReference, modelType);
  }

  @Get("")
  getReclaims(@Query() filter: FilterReclaimDto) {
    return this.reclaims.getReclaims(filter);
  }

  @Delete(":id")
  deleteReclaim(@Param("id") id: string) {
    return this.reclaims.deleteReclaim(Number(id));
  }
}
