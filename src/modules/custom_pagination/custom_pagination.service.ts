import { FilterCustomPaginationDto } from "./dto/fiter-custom-pagination.dto";
import { PrismaClient } from "@prisma/client";

export class CustomPaginationService {
  static async _getPaginationModel(
    prisma: PrismaClient,
    model: string,
    filter: FilterCustomPaginationDto,
    searchableFields: string[] = [],
  ) {
    const page = Number(filter.page) || 1;
    const pageSize = Number(filter.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const orConditions = filter.search
      ? this.buildOrConditions(searchableFields, filter.search)
      : undefined;

    const whereConditions = filter.whereFields
      ? {
          ...filter.whereFields,
          ...(orConditions ? { OR: orConditions } : {}),
        }
      : orConditions
        ? { OR: orConditions }
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

  static generateSearchCondition(
    fieldParts: string[],
    isNoSome: boolean,
    searchTerm: string,
  ) {
    const relation = fieldParts[0];
    const nestedField = fieldParts.slice(1).join(".");

    if (fieldParts.length > 1) {
      if (nestedField.includes(".")) {
        return isNoSome
          ? {
              [relation]: {
                [nestedField.split(".")[0]]: {
                  [nestedField.slice(nestedField.indexOf(".") + 1)]: {
                    contains: searchTerm,
                  },
                },
              },
            }
          : {
              [relation]: {
                some: {
                  [nestedField.split(".")[0]]: {
                    [nestedField.slice(nestedField.indexOf(".") + 1)]: {
                      contains: searchTerm,
                    },
                  },
                },
              },
            };
      }

      return isNoSome
        ? {
            [relation]: {
              [nestedField]: {
                contains: searchTerm,
              },
            },
          }
        : {
            [relation]: {
              some: {
                [nestedField]: {
                  contains: searchTerm,
                },
              },
            },
          };
    }
  }

  static buildOrConditions(searchableFields: string[], searchTerm: string) {
    return searchableFields
      .map((field) => {
        const { isNoSome, fieldParts } = this.getNestedFieldParts(field);
        return this.generateSearchCondition(fieldParts, isNoSome, searchTerm);
      })
      .filter((condition) => condition !== undefined);
  }

  static getNestedFieldParts(field: string) {
    const isNoSome = field.includes(".nosome");
    const cleanField = field.replace(".nosome", "");
    const fieldParts = cleanField.split(".");
    return { isNoSome, cleanField, fieldParts };
  }
}
