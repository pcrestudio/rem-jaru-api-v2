import { Body, Controller, Post, Query } from "@nestjs/common";
import { ReclaimsService } from "./reclaims.service";
import { UpsertReclaimDto } from "./dto/upsert-reclaim.dto";

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
}
