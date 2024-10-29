import { Module } from "@nestjs/common";
import { MasterService } from "./master.service";
import { MasterController } from "./master.controller";

@Module({
  providers: [MasterService],
  controllers: [MasterController],
})
export class MasterModule {}
