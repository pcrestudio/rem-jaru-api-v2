import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import axios from "axios";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ExchangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async createExchange(id?: number) {
    const { data } = await axios.get(
      `${this.config.get("EXCHANGE_RATE_URL")}/${this.config.get("EXCHANGE_RATE_API_KEY")}/latest/USD`,
    );

    if (data) {
      const response = await this.prisma.exchange.upsert({
        create: {
          value: data["conversion_rates"]["PEN"],
        },
        update: {
          value: data["conversion_rates"]["PEN"],
        },
        where: {
          id: id ? id : 0,
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

  async getExchange() {
    return this.prisma.exchange.findFirst({});
  }
}
