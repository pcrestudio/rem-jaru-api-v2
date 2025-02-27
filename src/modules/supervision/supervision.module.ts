import { Module } from "@nestjs/common";
import { SupervisionController } from "./supervision.controller";
import { SupervisionService } from "./supervision.service";
import { MailService } from "../../shared/mail/mail.service";

@Module({
  providers: [SupervisionService, MailService],
  controllers: [SupervisionController],
})
export class SupervisionModule {}
