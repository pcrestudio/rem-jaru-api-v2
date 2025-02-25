import { Module } from "@nestjs/common";
import { JudicialProcessService } from "./judicial-process.service";
import { JudicialProcessController } from "./judicial-process.controller";
import { MailService } from "../../shared/mail/mail.service";

@Module({
  providers: [JudicialProcessService, MailService],
  controllers: [JudicialProcessController],
})
export class JudicialProcessModule {}
