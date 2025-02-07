import { Controller, Get, Post, Query } from "@nestjs/common";
import { ExchangeService } from "./exchange.service";
import { Public } from "../../shared/auth/decorators/public.decorator";

@Controller("exchange")
export class ExchangeController {
  constructor(private readonly exchange: ExchangeService) {}

  @Public()
  @Post("create")
  async createExchange(@Query("id") id: string) {
    return this.exchange.createExchange(Number(id));
  }

  @Public()
  @Get("")
  async getExchange() {
    return this.exchange.getExchange();
  }
}
