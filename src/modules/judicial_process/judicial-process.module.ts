import { Module } from "@nestjs/common";
import { JudicialProcessService } from "./judicial-process.service";
import { JudicialProcessController } from "./judicial-process.controller";
import { CustomPaginationModule } from "../custom_pagination/custom_pagination.module";

@Module({
  providers: [JudicialProcessService],
  controllers: [JudicialProcessController],
  imports: [CustomPaginationModule],
})
export class JudicialProcessModule {}
