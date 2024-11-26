import { Prisma } from "@prisma/client";

const prefixMapping: Record<string, string> = {
  JudicialProcess: "JP",
};

export const prismaMiddleware: Prisma.Middleware = async (params, next) => {
  if (params.action === "create") {
    const prefix = prefixMapping[params.model];
    if (prefix) {
      const result = await next(params);
      result.entityReference = `${prefix}${result.id.toString().padStart(8, "0")}`;
      return result;
    }
  }

  return next(params);
};
