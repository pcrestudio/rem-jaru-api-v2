import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { FilterReportDto } from "./dto/filter-report.dto";
import { MasterOptionConfig } from "../../config/master-option.config";
import { AttributeSlugConfig } from "../../config/attribute-slug.config";
import { GetReportAttributeValues } from "./dto/get-report-attribute-values";
import { getModelByEntityReference } from "../../common/utils/entity_reference_mapping";
import { MasterTodosStates } from "../../config/master-todos-states.config";

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async getInitReportByFilter(filter: FilterReportDto) {
    const moduleId = Number(filter.moduleId ?? 0);

    const [attributesWithValues] = await this.prisma.$transaction([
      this.prisma.sectionAttribute.findMany({
        where: {
          moduleId,
          isForReport: true,
        },
        select: {
          slug: true,
          label: true,
          sectionAttributeId: true,
          values: {
            where: {
              value: { not: "" },
            },
          },
          options: {
            where: {
              isActive: true,
            },
            select: {
              optionLabel: true,
              optionValue: true,
            },
          },
        },
      }),
    ]);

    const projects = await this.getGeneralProjects();
    const judicialProcesses = await this.getJudicialProcessesReport(moduleId);
    const { provisionAmountSum, contingencyGroups, criticalProcessGroups } =
      await this.getAttributesValuesReport(attributesWithValues);

    return {
      provisionAmount: {
        report: provisionAmountSum,
      },
      contingencies: {
        report: contingencyGroups,
      },
      criticalProcesses: {
        report: criticalProcessGroups,
      },
      matters: {
        report: judicialProcesses,
      },
      studio: {
        report: projects,
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

  private async getJudicialProcessesReport(moduleId: number) {
    return this.prisma.module.findMany({
      where: {
        id: moduleId,
      },
      select: {
        Submodule: {
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

  private async getGeneralProjects() {
    return this.prisma.master.findMany({
      where: {
        slug: MasterOptionConfig.proyectosGeneral,
      },
      select: {
        masterOption: {
          select: {
            name: true,
            _count: {
              select: {
                judicialProjects: true,
              },
            },
          },
        },
      },
    });
  }

  private async getAttributesValuesReport(
    attributesWithValues: GetReportAttributeValues[],
  ) {
    const provisionAmount = attributesWithValues.find(
      (item) => item.slug === AttributeSlugConfig.provisionAmount,
    );

    const sum = provisionAmount.values.reduce((acc, curr) => {
      return acc + parseFloat(curr.value);
    }, 0);

    const processAttributeOptions = (attributeSlug: string, options: any) => {
      const selectedValues = attributesWithValues
        .find((attribute) => attribute.slug === attributeSlug)
        ?.values.map((value) => value.value);

      return options.map((option: any) => {
        const count =
          selectedValues?.filter((value) => value === option.optionValue)
            .length || 0;
        return {
          name: option.optionValue,
          _count: { group: count },
        };
      });
    };

    const contingencyGroups = processAttributeOptions(
      AttributeSlugConfig.contingencyLevel,
      attributesWithValues.find(
        (item) => item.slug === AttributeSlugConfig.contingencyLevel,
      ).options,
    );

    const criticalProcessGroups = processAttributeOptions(
      AttributeSlugConfig.criticalProcess,
      attributesWithValues.find(
        (item) => item.slug === AttributeSlugConfig.criticalProcess,
      ).options,
    );

    return {
      provisionAmountSum: sum,
      contingencyGroups,
      criticalProcessGroups,
    };
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
        const state = item.todo.state || {};

        if (slugsToMatch.includes(state["slug"])) {
          const existingState = acc.states.find(
            (s: any) => s.label === state["name"],
          );

          if (existingState) {
            existingState.count += 1;

            if (item.alert) {
              existingState.alertTrue += 1;
            } else {
              existingState.alertFalse += 1;
            }

            if (item.check) {
              existingState.checkTrue += 1;
            } else {
              existingState.checkFalse += 1;
            }
          } else {
            acc.states.push({
              label: state["name"],
              slug: state["slug"],
              count: 1,
              alertTrue: item.alert ? 1 : 0,
              alertFalse: item.alert ? 0 : 1,
              checkTrue: item.check ? 1 : 0,
              checkFalse: item.check ? 0 : 1,
            });
          }
        }

        return acc;
      },
      { states: [] },
    );
  }
}
