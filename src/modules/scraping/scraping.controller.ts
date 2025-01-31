import { Controller, Get } from "@nestjs/common";
import { ScrapingService } from "./scraping.service";
import { Public } from "src/shared/auth/decorators/public.decorator";

@Controller("scraping")
export class ScrapingController {
  constructor(private readonly scraping: ScrapingService) {}

  @Public()
  @Get("")
  async getCejGobPage() {
    return this.scraping.getCejGobPage();
  }
}
