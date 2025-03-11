import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { Response } from "express";
import { InstanceService } from "./instance.service";
import { UpsertInstanceDto } from "./dto/upsert-instance.dto";
import { UpsertInstanceStepDto } from "./dto/upsert-instance-step.dto";
import { UpsertInstanceStepDataDto } from "./dto/upsert-instance-stepdata.dto";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { multerConfig } from "../../config/multer.config";
import * as path from "path";
import { ExportablesService } from "../exportables/exportables.service";

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

  @Post("bulk/steps")
  async upsertInstanceStepBulk(@Body() instanceSteps: UpsertInstanceStepDto[]) {
    return this.instanceService.upsertInstanceStepBulk(instanceSteps);
  }

  @Post("upsert/step/record")
  @UseInterceptors(AnyFilesInterceptor(multerConfig))
  async upsertInstanceStepData(
    @Body() instanceStepData: UpsertInstanceStepDataDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
  ) {
    const user = req.user;

    return this.instanceService.upsertInstanceStepData(
      instanceStepData,
      files,
      Number(user.userId),
    );
  }

  @Get("")
  async getInstanceSteps(
    @Query("entityReference") entityReference: string,
    @Query("modelType") modelType: string,
  ) {
    return this.instanceService.getInstanceSteps(entityReference, modelType);
  }

  @Get("settings")
  async getInstancesSettings() {
    return this.instanceService.getInstancesSettings();
  }

  @Delete(":id")
  async deleteIncident(@Param("id") instanceStepId: string) {
    return this.instanceService.deleteIncident(Number(instanceStepId));
  }

  @Get("export")
  async exportDocument(
    @Query("fileName") fileName: string,
    @Res() res: Response,
  ) {
    if (!fileName) {
      throw new BadRequestException('El parámetro "fileName" es obligatorio.');
    }

    const fileExtension = path.extname(fileName).toLowerCase();

    const fileContent = await this.instanceService.exportDocument(fileName);

    if (
      fileExtension === ".pdf" ||
      fileExtension === ".png" ||
      fileExtension === ".jpg"
    ) {
      res.setHeader(
        "Content-Type",
        ExportablesService.getMimeType(fileExtension),
      );
      res.send(fileContent);
    } else if (fileExtension === ".docx" || fileExtension === ".xlsx") {
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      res.setHeader(
        "Content-Type",
        ExportablesService.getMimeType(fileExtension),
      );
      res.send(fileContent);
    } else {
      throw new BadRequestException("Tipo de archivo no soportado.");
    }
  }
}
