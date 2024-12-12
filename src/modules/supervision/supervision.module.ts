import { Module } from "@nestjs/common";
import { SupervisionController } from "./supervision.controller";
import { SupervisionService } from "./supervision.service";

@Module({
  providers: [SupervisionService],
  controllers: [SupervisionController],
})
export class SupervisionModule {}
