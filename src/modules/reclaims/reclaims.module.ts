import { Module } from "@nestjs/common";
import { ReclaimsController } from "./reclaims.controller";
import { ReclaimsService } from "./reclaims.service";

@Module({
  providers: [ReclaimsService],
  controllers: [ReclaimsController],
})
export class ReclaimsModule {}
