import { Module } from "@nestjs/common";
import { InstanceController } from "./instance.controller";
import { InstanceService } from "./instance.service";

@Module({
  providers: [InstanceService],
  controllers: [InstanceController],
})
export class InstanceModule {}
