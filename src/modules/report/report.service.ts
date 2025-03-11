import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { FilterReportDto } from "./dto/filter-report.dto";
import {
  EntityReferenceModel,
  getModelByEntityReference,
} from "../../common/utils/entity_reference_mapping";
import { MasterTodosStates } from "../../config/master-todos-states.config";
import { AttributeSlugConfig } from "../../config/attribute-slug.config";
import { MasterOptionConfig } from "../../config/master-option.config";

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async getInitReportByFilter(filter: FilterReportDto) {
    const allData = await this.prisma.module.findMany({
      where: {
        isActive: true,
        name: filter.moduleId,
      },
      include: {
        Submodule: {
          include: {
            JudicialProcess: {
              where: filter.cargoStudioId
                ? { cargoStudioId: Number(filter.cargoStudioId) }
                : {},
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
                stepData: {
                  include: {
                    step: {
                      include: {
                        instance: true,
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
            Supervision: {
              where: filter.cargoStudioId
                ? { cargoStudioId: Number(filter.cargoStudioId) }
                : {},
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
                stepData: {
                  include: {
                    step: {
                      include: {
                        instance: true,
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
          },
        },
      },
    });

    const provisionAmountSum = this.sumProvisionAmount(allData);
    const amountSum = this.sumAmount(allData);
    const savingAmount = this.savingAmount(allData);

    const contingencies = await this.getContingenciesLevel(allData);

    const criticalProcesses = await this.getTotalByAttributeOptionSlug(
      allData,
      allData[0].name === "Supervisiones"
        ? AttributeSlugConfig.supervisionCriticalProcess
        : AttributeSlugConfig.criticalProcess,
    );

    const causes = await this.getTotalByAttributeOptionSlug(
      allData,
      allData[0].name === "Supervisiones"
        ? AttributeSlugConfig.supervisionCause
        : AttributeSlugConfig.cause,
    );

    const matters = await this.getMattersReport(
      filter,
      Number(filter.cargoStudioId),
    );

    const instances = await this.getInstancesReport(
      allData,
      Number(filter.cargoStudioId),
    );

    const studios = await this.getReportByStudio(filter);

    const responsible = await this.getReportByResponsible(filter);

    return {
      provisionAmount: {
        report: Number(provisionAmountSum).toFixed(2),
      },
      amountSum: {
        report: Number(amountSum).toFixed(2),
      },
      savingAmount: {
        report: Number(savingAmount).toFixed(2),
      },
      internalSpecialists: {
        report: responsible,
      },
      causes: {
        report: causes,
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
      instances: {
        report: instances,
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

    const filterTodos = reportTodos.filter((todo) => {
      const matchesSubmodule =
        todo.submoduleId === Number(filter.submoduleId) &&
        todo.submodule.module.name === filter.moduleId;

      // Filtramos por cargoStudioId solo si existe en el filtro
      const matchesCargoStudio = filter.cargoStudioId
        ? todo.cargoStudioId === Number(filter.cargoStudioId)
        : true;

      return matchesSubmodule && matchesCargoStudio;
    });

    return this._countTotalStates(filterTodos);
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
        entityJudicialProcessReference: true,
        entitySupervisionReference: true,
        value: true,
      },
    });

    const resolvedDetails = await Promise.all(
      attributeValues.map(async (value) => {
        const detail = await this.resolveSubmodule(
          value.entityJudicialProcessReference,
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
      where: { name: filter.moduleId },
      select: {
        id: true,
        Submodule: {
          where: filter.submoduleId
            ? { id: Number(filter.submoduleId) }
            : undefined,
          select: {
            id: true,
            JudicialProcess: {
              where: filter.responsibleId
                ? {
                    responsibleId: Number(filter.responsibleId),
                  }
                : undefined,
              select: {
                responsibleId: true,
                responsible: true,
                studio: true,
                cargoStudioId: true,
              },
            },
            Supervision: {
              where: filter.responsibleId
                ? {
                    responsibleId: Number(filter.responsibleId),
                  }
                : undefined,
              select: {
                responsibleId: true,
                responsible: true,
                authorityId: true,
                authority: true,
                studio: true,
              },
            },
          },
        },
      },
    });

    console.log(moduleData);

    if (!moduleData) {
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

    for (const submodule of moduleData.Submodule) {
      const combinedProcesses = [
        ...submodule.JudicialProcess,
        ...submodule.Supervision,
      ];

      for (const process of combinedProcesses) {
        const responsible = process.responsible;

        if (!responsible) continue;

        const fullName = `${responsible.firstName} ${responsible.lastName}`;

        result[fullName] = (result[fullName] || 0) + 1;
      }
    }

    return Object.entries(result).map(([name, count]) => ({ name, count }));
  }

  async getReportByDemandedOrPlaintiff(filter: FilterReportDto) {
    const slug = filter.tabSlug
      .replace("by", "")
      .replace(/^\w/, (c) => c.toLowerCase());

    const whereStudio = filter.cargoStudioId
      ? { cargoStudioId: Number(filter.cargoStudioId) }
      : {};

    const processData = await this.prisma.module.findFirst({
      where: {
        name: filter.moduleId,
      },
      select: {
        id: true,
        Submodule: {
          where: filter.submoduleId
            ? { id: Number(filter.submoduleId) }
            : undefined,
          select: {
            id: true,
            JudicialProcess: {
              where: whereStudio,
            },
            Supervision: { where: whereStudio },
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

    for (const submodule of processData.Submodule) {
      const combinedProcesses = [
        ...submodule.JudicialProcess,
        ...submodule.Supervision,
      ];

      for (const process of combinedProcesses) {
        const person = process[`${slug}`];

        if (result[person]) {
          result[person]++;
        } else {
          result[person] = 1;
        }
      }
    }

    return Object.entries(result).map(([name, count]) => ({
      name,
      count,
    }));
  }

  async getReportByStudio(filter: FilterReportDto) {
    const studioData = await this.prisma.module.findFirst({
      where: {
        name: filter.moduleId,
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
            Supervision: {
              where: filter.cargoStudioId
                ? { cargoStudioId: Number(filter.cargoStudioId) }
                : undefined,
              select: {
                responsibleId: true,
                responsible: true,
                authorityId: true,
                authority: true,
                studio: true,
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
      const combinedProcesses = [
        ...submodule.JudicialProcess,
        ...submodule.Supervision,
      ];

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
        submodule: { module: { name: filter.moduleId } },
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
          total += parseFloat(process.provisionAmount);
        });

        submodule.Supervision.forEach((process) => {
          total += parseFloat(process.provisionAmount);
        });
      });
    });

    return total;
  }

  private sumAmount(data) {
    let total = 0;

    data.forEach((item) => {
      item.Submodule.forEach((submodule) => {
        submodule.JudicialProcess.forEach((process) => {
          total += parseFloat(process.amount);
        });

        submodule.Supervision.forEach((process) => {
          total += parseFloat(process.amount);
        });
      });
    });

    return total;
  }

  private savingAmount(data) {
    let total = 0;

    data.forEach((item) => {
      item.Submodule.forEach((submodule) => {
        submodule.JudicialProcess.forEach((process) => {
          total += parseFloat(process.savingAmount);
        });

        submodule.Supervision.forEach((process) => {
          total += parseFloat(process.savingAmount);
        });
      });
    });

    return total;
  }

  private async getMattersReport(
    filter?: FilterReportDto,
    cargoStudioId?: number,
  ) {
    const report = await this.prisma.module.findMany({
      select: {
        Submodule: {
          where: {
            module: {
              name: filter.moduleId,
            },
          },
          select: {
            name: true,
            _count: {
              select: {
                JudicialProcess: cargoStudioId
                  ? { where: { cargoStudioId } }
                  : true,
                Supervision: cargoStudioId
                  ? { where: { cargoStudioId } }
                  : true,
              },
            },
          },
        },
      },
    });

    const matters = report.filter((matter) => matter.Submodule.length > 0);

    return matters.map((matter) => {
      return {
        ...matter,
      };
    });
  }

  private async getInstancesReport(allData: any, cargoStudioId?: number) {
    const id = allData[0].id;

    // Step 1: Fetch all instances for the module
    const instances = await this.prisma.instance.findMany({
      where: {
        moduleId: id,
      },
    });

    // Step 2: Initialize counts for each instance
    const instanceCounts = instances.reduce((acc, instance) => {
      acc[instance.name] = 0;
      return acc;
    }, {});

    // Paso 3: Iterar sobre los datos y contar instancias filtradas por cargoStudioId si existe
    for (const report of allData) {
      for (const submodule of report.Submodule) {
        if (submodule.JudicialProcess) {
          submodule.JudicialProcess.forEach((jp) => {
            // Filtrar por cargoStudioId si está definido
            if (!cargoStudioId || jp.cargoStudioId === cargoStudioId) {
              const latestStepData = jp.stepData[jp.stepData.length - 1];
              const instanceName = latestStepData?.step.instance.name;

              if (instanceCounts.hasOwnProperty(instanceName)) {
                instanceCounts[instanceName]++;
              }
            }
          });
        }

        if (submodule.Supervision) {
          submodule.Supervision.forEach((supervision) => {
            // Filtrar por cargoStudioId si está definido
            if (!cargoStudioId || supervision.cargoStudioId === cargoStudioId) {
              const latestStepData =
                supervision.stepData[supervision.stepData.length - 1];
              const instanceName = latestStepData?.step.instance.name;

              if (instanceCounts.hasOwnProperty(instanceName)) {
                instanceCounts[instanceName]++;
              }
            }
          });
        }
      }
    }

    // Step 4: Format the result
    return Object.entries(instanceCounts).map(([instanceName, count]) => ({
      instanceName,
      count,
    }));
  }

  private async getTotalValueBySlug(data: any, slug: string) {
    const values = await this.prisma.sectionAttributeValue.findMany({
      where: { attribute: { slug: slug } },
    });

    const counter = {};

    values.forEach((option) => {
      counter[option.value] = 0;
    });

    values.forEach(({ value }) => {
      if (value) {
        counter[value]++;
      }
    });

    return Object.keys(counter).map((optionLabel) => ({
      name: optionLabel,
      _count: { group: counter[optionLabel] },
    }));
  }

  private async getTotalByAttributeOptionSlug(data: any, slug: string) {
    const options = await this.prisma.sectionAttributeOption.findMany({
      where: { attribute: { slug: slug } },
    });

    const counter = {};
    options.forEach((option) => {
      counter[option.optionLabel] = 0;
    });

    data.forEach((item) => {
      item.Submodule.forEach((submodule) => {
        [submodule.JudicialProcess, submodule.Supervision].forEach(
          (processList) => {
            processList.forEach((process) => {
              [
                ...process.sectionAttributeValues,
                ...process.globalAttributeValues,
              ].forEach((attrValue) => {
                if (
                  attrValue.attribute.slug === slug &&
                  attrValue.attribute.isMultiple
                ) {
                  const valuesArray = attrValue.value
                    .split(", ")
                    .map((v) => v.trim());

                  attrValue.attribute.options.forEach((option) => {
                    if (valuesArray.includes(option.optionValue)) {
                      counter[option.optionLabel] += 1;
                    }
                  });
                }

                if (
                  attrValue.attribute.slug === slug &&
                  !attrValue.attribute.isMultiple
                ) {
                  const option = attrValue.attribute.options.find(
                    (opt) => opt.optionValue === attrValue.value,
                  );

                  if (option) {
                    counter[option.optionLabel]++;
                  }
                }
              });
            });
          },
        );
      });
    });

    // Formatear resultado
    return Object.keys(counter).map((optionLabel) => ({
      name: optionLabel,
      _count: { group: counter[optionLabel] },
    }));
  }

  private async getContingenciesLevel(data: any) {
    const masterOptions = await this.prisma.masterOption.findMany({
      where: {
        master: {
          slug: MasterOptionConfig["nivel-contingencia"],
        },
      },
    });

    const counter = {};
    masterOptions.forEach((option) => {
      counter[option.slug] = 0;
    });

    data.forEach((item) => {
      const name =
        item.name === "Supervisiones"
          ? EntityReferenceModel.Supervision
          : EntityReferenceModel.JudicialProcess;

      item.Submodule.forEach((process) => {
        return process[`${name}`].forEach((v) => {
          if (counter.hasOwnProperty(v.contingencyLevel)) {
            counter[v.contingencyLevel]++;
          }
        });
      });
    });

    return masterOptions.map((option) => ({
      name: option.name,
      slug: option.slug,
      count: counter[option.slug] || 0,
    }));
  }
}
