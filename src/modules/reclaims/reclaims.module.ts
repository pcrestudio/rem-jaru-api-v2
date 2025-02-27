import { Module } from "@nestjs/common";
import { ReclaimsController } from "./reclaims.controller";
import { ReclaimsService } from "./reclaims.service";
import { MailService } from "../../shared/mail/mail.service";

@Module({
  providers: [ReclaimsService, MailService],
  controllers: [ReclaimsController],
})
export class ReclaimsModule {}
