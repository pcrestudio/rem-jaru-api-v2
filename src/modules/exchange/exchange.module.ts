import { Module } from "@nestjs/common";
import { ExchangeController } from "./exchange.controller";
import { ExchangeService } from "./exchange.service";
import { GetExchangeTask } from "./get-exchange.task";

@Module({
  providers: [ExchangeService, GetExchangeTask],
  controllers: [ExchangeController],
})
export class ExchangeModule {}
