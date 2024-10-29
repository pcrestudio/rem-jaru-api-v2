import { Module } from "@nestjs/common";
import { JudicialProcessService } from "./judicial-process.service";
import { JudicialProcessController } from "./judicial-process.controller";

@Module({
  providers: [JudicialProcessService],
  controllers: [JudicialProcessController],
})
export class JudicialProcessModule {}
