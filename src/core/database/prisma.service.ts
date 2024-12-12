import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { ConfigService } from "@nestjs/config";

const prefixMapping: Record<string, string> = {
  judicial_process_administrative: "JPA",
  judicial_process_labor_court: "JPL",
  judicial_process_civil_court: "JPC",
  judicial_process_criminal: "JPCR",
  supervision_administrative_processes: "SPA",
};

@Injectable()
export class PrismaService extends PrismaClient {
  $extended: any;

  constructor(config: ConfigService) {
    super({
      log: [],
      datasources: {
        db: {
          url: config.get("DATABASE_URL"),
        },
      },
    });

    this.$extended = this.$extends({
      query: {
        judicialProcess: {
          create: async ({ model, query, args }) => {
            const result = await query(args);
            const submodule = await this.submodule.findFirst({
              where: {
                id: result.submoduleId,
              },
            });

            const entityReference = `${prefixMapping[submodule.slug]}${result.id.toString().padStart(8, "0")}`;

            await this[model].update({
              where: {
                id: result.id,
              },
              data: {
                entityReference,
              },
            });

            return { result };
          },
        },
        supervision: {
          create: async ({ model, query, args }) => {
            const result = await query(args);
            const submodule = await this.submodule.findFirst({
              where: {
                id: result.submoduleId,
              },
            });

            const entityReference = `${prefixMapping[submodule.slug]}${result.id.toString().padStart(8, "0")}`;

            await this[model].update({
              where: {
                id: result.id,
              },
              data: {
                entityReference,
              },
            });

            return { result };
          },
        },
        stepData: {
          upsert: async ({ model, query, args }) => {
            const result = await query(args);

            const entityReference = `ISD${result.id.toString().padStart(8, "0")}`;

            await this[model].update({
              data: {
                entityId: entityReference,
              },
              where: {
                id: result.id,
              },
            });

            return { result, entityReference };
          },
        },
      },
    });
  }
}
