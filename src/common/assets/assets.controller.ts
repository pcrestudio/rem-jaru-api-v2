import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AssetsService } from "./assets.service";

@Controller("assets")
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // Endpoint to upload font files, logos, and background images
  @Post("upload")
  @UseInterceptors(FileInterceptor("file")) // 'file' is the field name for the file input
  async uploadFile(
    @UploadedFiles() file: Express.Multer.File,
    @Body() body: any
  ) {
    const { type, userId } = body;

    if (type === "font") {
      return this.assetsService.uploadFont(file, userId);
    } else if (type === "logo") {
      return this.assetsService.uploadLogo(file, userId);
    } else if (type === "background") {
      return this.assetsService.uploadBackgroundImage(file, userId);
    } else {
      throw new Error("Invalid file type");
    }
  }
}
