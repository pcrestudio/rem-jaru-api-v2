import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../core/database/prisma.service";

@Injectable()
export class GetExchangeTask {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Cron("0 */6 * * *") // Runs every six hours
  async getExchangeTask() {
    const { data } = await axios.get(
      `${this.config.get("EXCHANGE_RATE_URL")}/${this.config.get("EXCHANGE_RATE_API_KEY")}/latest/USD`,
    );

    console.log("Cambio referencial", data["conversion_rates"]["PEN"]);

    if (data) {
      const response = await this.prisma.exchange.create({
        data: {
          value: data["conversion_rates"]["PEN"],
        },
      });

      return {
        response,
        message: "Conversión almacenada.",
      };
    }

    return {
      response: {},
      message: "La conversión no se realizó.",
    };
  }
}
