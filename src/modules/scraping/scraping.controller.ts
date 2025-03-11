import {
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { ScrapingService } from "./scraping.service";
import { Public } from "src/shared/auth/decorators/public.decorator";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { multerConfig } from "../../config/multer.config";

@Controller("scraping")
export class ScrapingController {
  constructor(private readonly scraping: ScrapingService) {}

  @Public()
  @Get("")
  async getCejGobPage() {
    return this.scraping.getCejGobPage();
  }

  @UseInterceptors(AnyFilesInterceptor(multerConfig))
  @Public()
  @Post("template")
  async importTemplate(@UploadedFiles() files: Express.Multer.File[]) {
    return this.scraping.importTemplate(files);
  }
}
