import { Module } from "@nestjs/common";
import { CejController } from "./cej.controller";
import { CejService } from "./cej.service";

@Module({
  providers: [CejService],
  controllers: [CejController],
})
export class CejModule {}
