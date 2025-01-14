import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { FilterReportDto } from "./dto/filter-report.dto";
import { getModelByEntityReference } from "../../common/utils/entity_reference_mapping";
import { MasterTodosStates } from "../../config/master-todos-states.config";
import { AttributeSlugConfig } from "../../config/attribute-slug.config";

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async getInitReportByFilter(filter: FilterReportDto) {
    const moduleId = Number(filter.moduleId ?? 0);

    const allData = await this.prisma.module.findMany({
      where: {
        id: moduleId,
        isActive: true,
      },
      include: {
        Submodule: {
          include: {
            JudicialProcess: {
              include: {
                sectionAttributeValues: {
                  where: {
                    attribute: {
                      isForReport: true,
                    },
                  },
                  include: {
                    attribute: {
                      include: {
                        options: true,
                      },
                    },
                  },
                },
                globalAttributeValues: {
                  where: {
                    attribute: {
                      isForReport: true,
                    },
                  },
                  include: {
                    attribute: {
                      include: {
                        options: true,
                      },
                    },
                  },
                },
              },
            },
            Supervision: {},
          },
        },
      },
    });

    const provisionAmountSum = this.sumProvisionAmount(allData);
    const contingencies = this.countBySlug(
      allData,
      AttributeSlugConfig.contingencyLevel,
    );

    const criticalProcesses = this.countBySlug(
      allData,
      AttributeSlugConfig.criticalProcess,
    );

    const matters = await this.getMattersReport(moduleId);

    const studios = await this.getReportByStudio(filter);

    return {
      provisionAmount: {
        report: provisionAmountSum,
      },
      contingencies: {
        report: contingencies,
      },
      criticalProcesses: {
        report: criticalProcesses,
      },
      matters: {
        report: matters,
      },
      studio: {
        report: [
          {
            masterOption: studios.map((report) => ({
              name: report.name,
              _count: { judicialStudios: report.count },
            })),
          },
        ],
      },
    };
  }

  async getReportByTodos(filter: FilterReportDto) {
    const reportTodos = [];

    const todos = await this.prisma.toDo.findMany({
      select: {
        state: true,
        entityReference: true,
        id: true,
        creator: true,
        alert: true,
        check: true,
      },
    });

    for (const todo of todos) {
      const detail = await this.resolveSubmodule(todo.entityReference, filter);

      reportTodos.push({ ...detail, todo });
    }

    return this._countTotalStates(reportTodos);
  }

  async getGenericReportByTabSlug(filter: FilterReportDto) {
    const attributeSlug = filter.tabSlug
      .replace("by", "")
      .replace(/^\w/, (c) => c.toLowerCase());

    const attribute = await this.prisma.sectionAttribute.findFirst({
      where: { slug: attributeSlug },
      select: {
        sectionAttributeId: true,
        label: true,
        slug: true,
        options: true,
      },
    });

    if (!attribute) {
      return {
        title: "Número de orden por nivel de contingencia",
        data: [],
      };
    }

    const attributeValues = await this.prisma.sectionAttributeValue.findMany({
      where: { sectionAttributeId: attribute.sectionAttributeId },
      select: {
        entityReference: true,
        value: true,
      },
    });

    const resolvedDetails = await Promise.all(
      attributeValues.map(async (value) => {
        const detail = await this.resolveSubmodule(
          value.entityReference,
          filter,
        );
        return detail ? { ...value, submodule: detail.submodule } : null;
      }),
    );

    const validDetails = resolvedDetails.filter(Boolean);

    const filteredDetails = validDetails.filter((item) => {
      const { submodule } = item || {};
      const { id, moduleId } = submodule || {};

      if (filter.submoduleId) {
        return id === Number(filter.submoduleId);
      }

      if (filter.moduleId) {
        return moduleId === Number(filter.moduleId);
      }

      return true;
    });

    const counts = filteredDetails.reduce(
      (acc, value) => {
        const matchingOption = attribute.options.find(
          (option) => option.optionValue === value.value,
        );

        if (matchingOption) {
          acc[matchingOption.optionLabel] =
            (acc[matchingOption.optionLabel] || 0) + 1;
        }

        return acc;
      },
      {} as Record<string, number>,
    );

    const data = Object.entries(counts).map(([label, count]) => ({
      label,
      count,
    }));

    const title = filter.submoduleId
      ? `Número de orden por nivel de contingencia en submódulo`
      : `Número de orden por nivel de contingencia en módulo`;

    return {
      title,
      reportData: data,
    };
  }

  async getReportByResponsible(filter: FilterReportDto) {
    const moduleData = await this.prisma.module.findFirst({
      where: {
        id: Number(filter.moduleId),
      },
      select: {
        id: true,
        Submodule: {
          where: filter.submoduleId
            ? { id: Number(filter.submoduleId) }
            : undefined,
          include: {
            JudicialProcess: {
              where: filter.responsibleId
                ? { responsibleId: Number(filter.responsibleId) }
                : undefined,
              select: {
                responsibleId: true,
                responsible: true,
              },
            },
            Supervision: {
              where: filter.responsibleId
                ? { responsibleId: Number(filter.responsibleId) }
                : undefined,
              select: {
                responsibleId: true,
                responsible: true,
              },
            },
          },
        },
      },
    });

    if (!module) {
      throw new NotFoundException(
        `No data found for module with id ${filter.moduleId}`,
      );
    }

    if (!moduleData.Submodule || moduleData.Submodule.length === 0) {
      throw new NotFoundException(
        `Module ${filter.moduleId} has no associated submodules.`,
      );
    }

    const result: Record<string, number> = {};

    moduleData.Submodule.forEach((submodule: any) => {
      const combinedProcesses = [
        ...submodule.JudicialProcess,
        ...submodule.Supervision,
      ];

      combinedProcesses.forEach((process: any) => {
        const responsible = process.responsible;
        const fullName = `${responsible.firstName} ${responsible.lastName}`;

        if (result[fullName]) {
          result[fullName]++;
        } else {
          result[fullName] = 1;
        }
      });
    });

    return Object.entries(result).map(([name, count]) => ({
      name,
      count,
    }));
  }

  async getReportByDemandedOrPlaintiff(filter: FilterReportDto) {
    const slug = filter.tabSlug
      .replace("by", "")
      .replace(/^\w/, (c) => c.toLowerCase());

    const processData = await this.prisma.module.findFirst({
      where: {
        id: Number(filter.moduleId),
      },
      select: {
        id: true,
        Submodule: {
          where: filter.submoduleId
            ? { id: Number(filter.submoduleId) }
            : undefined,
          select: {
            id: true,
            JudicialProcess: true,
            Supervision: true,
          },
        },
      },
    });

    if (!processData) {
      throw new NotFoundException(
        `No data found for module with id ${filter.moduleId}`,
      );
    }

    if (!processData.Submodule || processData.Submodule.length === 0) {
      throw new NotFoundException(
        `Module ${filter.moduleId} has no associated submodules.`,
      );
    }

    const result: Record<string, number> = {};

    processData.Submodule.forEach((submodule: any) => {
      const combinedProcesses = [
        ...submodule.JudicialProcess,
        ...submodule.Supervision,
      ];

      combinedProcesses.forEach((process: any) => {
        const person = process[`${slug}`];

        if (result[person]) {
          result[person]++;
        } else {
          result[person] = 1;
        }
      });
    });

    return Object.entries(result).map(([name, count]) => ({
      name,
      count,
    }));
  }

  async getReportByStudio(filter: FilterReportDto) {
    const studioData = await this.prisma.module.findFirst({
      where: {
        id: Number(filter.moduleId),
      },
      select: {
        id: true,
        Submodule: {
          where: filter.submoduleId
            ? { id: Number(filter.submoduleId) }
            : undefined,
          include: {
            JudicialProcess: {
              where: filter.cargoStudioId
                ? { cargoStudioId: Number(filter.cargoStudioId) }
                : undefined,
              select: {
                responsibleId: true,
                responsible: true,
                studio: true,
                cargoStudioId: true,
              },
            },
          },
        },
      },
    });

    if (!studioData) {
      throw new NotFoundException(
        `No data found for module with id ${filter.moduleId}`,
      );
    }

    if (!studioData.Submodule || studioData.Submodule.length === 0) {
      throw new NotFoundException(
        `Module ${filter.moduleId} has no associated submodules.`,
      );
    }

    const result: Record<string, number> = {};

    studioData.Submodule.forEach((submodule: any) => {
      const combinedProcesses = [...submodule.JudicialProcess];

      combinedProcesses.forEach((process: any) => {
        const studio = process.studio;
        const studioName = studio.name;

        if (result[studioName]) {
          result[studioName]++;
        } else {
          result[studioName] = 1;
        }
      });
    });

    return Object.entries(result).map(([name, count]) => ({
      name,
      count,
    }));
  }

  private async resolveSubmodule(
    entityReference: string,
    filter: FilterReportDto,
  ) {
    const model = getModelByEntityReference(entityReference);

    if (!model) {
      console.warn(
        `No se encontró un modelo para la referencia: ${entityReference}`,
      );
      return null;
    }

    const whereClause: any = {
      AND: [
        {
          OR: [{ entityReference }],
        },
      ],
    };

    if (filter.moduleId) {
      whereClause.AND.push({
        submodule: { module: { id: Number(filter.moduleId) } },
      });
    }

    if (filter.submoduleId) {
      whereClause.AND.push({ submodule: { id: Number(filter.submoduleId) } });
    }

    try {
      return await this.prisma[`${model}`].findFirst({
        where: whereClause,
        include: {
          submodule: {
            include: {
              module: true,
            },
          },
        },
      });
    } catch (error) {
      console.error(`Error al obtener submodule para ${model}:`, error);
      return null;
    }
  }

  private _countTotalStates(todos: any) {
    const slugsToMatch = [
      MasterTodosStates.moreThanTwoWeeks,
      MasterTodosStates.lessThanTwoWeeks,
      MasterTodosStates.expired,
    ];

    return todos.reduce(
      (acc, item) => {
        const state = item?.todo?.state || {};

        if (slugsToMatch.includes(state["slug"])) {
          const isAlert = Boolean(item.todo.alert);
          const isCheck = Boolean(item.todo.check);

          let existingState = acc.states.find(
            (s: any) => s.slug === state["slug"],
          );

          if (!existingState) {
            existingState = {
              label: state["name"] || "Sin Nombre",
              slug: state["slug"],
              count: 0,
              alertTrue: 0,
              alertFalse: 0,
              checkTrue: 0,
              checkFalse: 0,
            };
            acc.states.push(existingState);
          }

          existingState.count += 1;
          existingState.alertTrue += isAlert ? 1 : 0;
          existingState.alertFalse += isAlert ? 0 : 1;
          existingState.checkTrue += isCheck ? 1 : 0;
          existingState.checkFalse += isCheck ? 0 : 1;
        }

        return acc;
      },
      { states: [] },
    );
  }

  private sumProvisionAmount(data) {
    let total = 0;

    data.forEach((item) => {
      item.Submodule.forEach((submodule) => {
        submodule.JudicialProcess.forEach((process) => {
          process.sectionAttributeValues.forEach((attrValue) => {
            if (
              attrValue.attribute.slug.startsWith(
                AttributeSlugConfig.provisionAmount,
              )
            ) {
              const value = parseFloat(attrValue.value);

              if (!isNaN(value)) {
                total += value;
              }
            }
          });

          process.globalAttributeValues.forEach((globalAttrValue) => {
            if (
              globalAttrValue.attribute.slug.startsWith(
                AttributeSlugConfig.provisionAmount,
              )
            ) {
              const value = parseFloat(globalAttrValue.value);

              if (!isNaN(value)) {
                total += value;
              }
            }
          });
        });
      });
    });

    return total;
  }

  private countBySlug(data: any, slug: string) {
    const result = [];

    data.forEach((item) => {
      item.Submodule.forEach((submodule) => {
        submodule.JudicialProcess.forEach((process) => {
          process.sectionAttributeValues.forEach((attrValue) => {
            if (attrValue.attribute.slug === slug) {
              const value = attrValue.value;

              const option = attrValue.attribute.options.find(
                (option) => option.optionValue === value,
              );

              if (option) {
                const existing = result.find(
                  (res) => res.name === option.optionLabel,
                );

                if (existing) {
                  existing._count.group += 1;
                } else {
                  result.push({
                    name: option.optionLabel,
                    _count: { group: 1 },
                  });
                }
              }
            }
          });

          process.globalAttributeValues.forEach((globalAttrValue) => {
            if (globalAttrValue.attribute.slug === slug) {
              const value = globalAttrValue.value;

              const option = globalAttrValue.attribute.options.find(
                (option) => option.optionValue === value,
              );

              if (option) {
                const existing = result.find(
                  (res) => res.name === option.optionLabel,
                );

                if (existing) {
                  existing._count.group += 1;
                } else {
                  result.push({
                    name: option.optionLabel,
                    _count: { group: 1 },
                  });
                }
              }
            }
          });
        });
      });
    });

    return result;
  }

  private async getMattersReport(moduleId: number) {
    return this.prisma.module.findMany({
      select: {
        Submodule: {
          where: {
            module: {
              id: moduleId,
            },
          },
          select: {
            name: true,
            _count: {
              select: {
                JudicialProcess: true,
              },
            },
          },
        },
      },
    });
  }
}
