import { FilterCustomPaginationDto } from "./dto/fiter-custom-pagination.dto";
import { PrismaClient } from "@prisma/client";

export class CustomPaginationService {
  static async _getPaginationModel(
    prisma: PrismaClient,
    model: string,
    filter: FilterCustomPaginationDto,
  ) {
    const page = Number(filter.page) || 1;
    const pageSize = Number(filter.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const whereConditions = filter.whereFields
      ? {
          ...filter.whereFields,
          ...(filter.orConditions ? { OR: filter.orConditions } : {}),
        }
      : {};

    const includeConditions = filter.includeConditions
      ? { ...filter.includeConditions }
      : {};

    const [results, total] = await prisma.$transaction([
      prisma[`${model}`].findMany({
        where: whereConditions,
        include: includeConditions,
        skip,
        take: pageSize,
      }),
      prisma[`${model}`].count({
        where: whereConditions,
      }),
    ]);

    return {
      results,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
