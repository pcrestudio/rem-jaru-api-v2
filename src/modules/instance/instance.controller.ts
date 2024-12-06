import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { Request } from "express";
import { InstanceService } from "./instance.service";
import { UpsertInstanceDto } from "./dto/upsert-instance.dto";
import { UpsertInstanceStepDto } from "./dto/upsert-instance-step.dto";
import { UpsertInstanceStepDataDto } from "./dto/upsert-instance-stepdata.dto";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { multerConfig } from "../../config/multer.config";

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
  @UseInterceptors(AnyFilesInterceptor(multerConfig))
  async upsertInstanceStepData(
    @Body() instanceStepData: UpsertInstanceStepDataDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    return this.instanceService.upsertInstanceStepData(
      instanceStepData,
      files,
      req,
    );
  }

  @Get("")
  async getInstanceSteps(@Query("entityReference") entityReference: string) {
    return this.instanceService.getInstanceSteps(entityReference);
  }
}
