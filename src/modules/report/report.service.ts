import { Injectable } from "@nestjs/common";
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
      },
    });

    for (const todo of todos) {
      const detail = await this.resolveSubmodule(todo.entityReference, filter);

      reportTodos.push({ ...detail, todo });
    }

    return this._countTotalStates(reportTodos);
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

    try {
      return await this.prisma[`${model}`].findFirst({
        where: {
          OR: [
            {
              entityReference: entityReference,
            },
          ],
        },
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

    return todos.reduce((acc, item) => {
      const state = item.todo.state || {};

      if (slugsToMatch.includes(state["slug"])) {
        acc[state["slug"]] = (acc[state["slug"]] || 0) + 1;
      }

      return acc;
    }, {});
  }
}
