import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { InstanceService } from "./instance.service";
import { UpsertInstanceDto } from "./dto/upsert-instance.dto";
import { UpsertInstanceStepDto } from "./dto/upsert-instance-step.dto";
import { UpsertInstanceStepDataDto } from "./dto/upsert-instance-stepdata.dto";

@Controller("instance")
export class InstanceController {
  constructor(private instanceService: InstanceService) {}

  @Post("upsert")
  async upsertInstance(@Body() instance: UpsertInstanceDto) {
    return this.instanceService.upsertInstance(instance);
  }

  @Post("upsert/step")
  async upsertInstanceStep(@Body() instanceStep: UpsertInstanceStepDto) {
    return this.instanceService.upsertInstanceStep(instanceStep);
  }

  @Post("upsert/step/record")
  async upsertInstanceStepData(
    @Body() instanceStepData: UpsertInstanceStepDataDto,
  ) {
    return this.instanceService.upsertInstanceStepData(instanceStepData);
  }

  @Get("")
  async getInstanceSteps(@Query("entityReference") entityReference: string) {
    return this.instanceService.getInstanceSteps(entityReference);
  }
}
