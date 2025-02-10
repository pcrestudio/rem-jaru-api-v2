import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { CreateSupervisionDto } from "./dto/create-supervision.dto";
import { CustomPaginationService } from "../custom_pagination/custom_pagination.service";
import {
  EntityReferenceModel,
  ModelType,
} from "../../common/utils/entity_reference_mapping";
import { FilterSupervisionDto } from "./dto/filter-supervision.dto";
import { EditSupervisionDto } from "./dto/edit-supervision.dto";
import { readFileSync } from "fs";
import { UtilsService } from "../../utils/utils.service";
import { GetModuleAttributeValueDto } from "../../utils/dto/get-module-attribute.value.dto";
import { AttributeSlugConfig } from "../../config/attribute-slug.config";
import { ExtendedAttributeConfig } from "../../config/extended-attribute.config";
import AngloMultipleTableHeaderCell from "../../common/utils/anglo_table_header_cell";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  VerticalAlign,
  WidthType,
} from "docx";
import AngloTableCell from "../../common/utils/anglo_table_cell";
import AngloSingleTableHeaderCell from "../../common/utils/anglo_table_single_header_cell";
import { angloDocHeader } from "../../common/utils/anglo_doc_header";
import { DataType } from "@prisma/client";
import { ExportablesService } from "../exportables/exportables.service";
import { searchableFields } from "../../config/submodule_searchableFields";
import { ToggleJudicialProcessDto } from "../judicial_process/dto/toggle-judicial-process.dto";
import capitalize from "../../utils/capitalize";

@Injectable()
export class SupervisionService {
  constructor(private prisma: PrismaService) {}

  async createSupervision(supervision: CreateSupervisionDto, slug: string) {
    const submodule = await this.prisma.submodule.findFirst({
      where: {
        slug,
      },
    });

    return this.prisma.$extended.supervision.create({
      data: {
        fileCode: supervision.fileCode,
        demanded: supervision.demanded,
        plaintiff: supervision.plaintiff,
        coDefendant: supervision.coDefendant,
        controversialMatter: supervision.controversialMatter,
        authorityId: supervision.authorityId,
        situationId: supervision.situationId,
        cargoStudioId: supervision.cargoStudioId,
        projectId: supervision.projectId,
        amount: Number(supervision.amount),
        responsibleId: supervision.responsibleId,
        submoduleId: submodule.id,
      },
    });
  }

  async editSupervision(
    supervision: EditSupervisionDto,
    slug: string,
    files: Express.Multer.File[],
  ) {
    const submodule = await this.prisma.submodule.findFirst({
      where: {
        slug,
      },
    });

    if (!supervision.id) {
      throw new BadRequestException(
        "Debe ingresar un ID correspondiente, para la edición",
      );
    }

    let guaranteeLetter: string = "";

    if (files && files.length > 0) {
      const file = files.find((f) => f.fieldname === "guaranteeLetter");
      guaranteeLetter = file ? file.filename : "";
    } else if (supervision.guaranteeLetter) {
      guaranteeLetter = supervision.guaranteeLetter;
    }

    try {
      return this.prisma.supervision.update({
        data: {
          fileCode: supervision.fileCode,
          demanded: supervision.demanded,
          plaintiff: supervision.plaintiff,
          coDefendant: supervision.coDefendant,
          controversialMatter: supervision.controversialMatter,
          contingencyLevel: supervision.contingencyLevel,
          contingencyPercentage: supervision.contingencyPercentage,
          provisionAmount: Number(supervision.provisionAmount),
          provisionContingency: Number(supervision.provisionContingency),
          comment: supervision.comment,
          amount: Number(supervision.amount),
          authorityId: Number(supervision.authorityId),
          cargoStudioId: Number(supervision.cargoStudioId),
          situationId: Number(supervision.situationId),
          responsibleId: Number(supervision.responsibleId),
          projectId: Number(supervision.projectId),
          isProvisional: supervision.isProvisional === "false" ? false : true,
          guaranteeLetter,
        },
        where: {
          id: Number(supervision.id),
          submoduleId: submodule.id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: `Error creating judicial process`,
        details: error.message,
      });
    }
  }

  async getSupervisionsBySlug(filter: FilterSupervisionDto) {
    const submodule = await this.prisma.submodule.findFirst({
      where: {
        slug: filter.slug,
      },
    });

    const whereFields = {
      submoduleId: submodule?.id,
      isActive: true,
    };

    if (filter.cargoStudioId) {
      whereFields["cargoStudioId"] = Number(filter.cargoStudioId);
    }

    if (filter.projectId) {
      whereFields["projectId"] = Number(filter.projectId);
    }

    if (filter.responsibleId) {
      whereFields["responsibleId"] = Number(filter.responsibleId);
    }

    const includeConditions: any = {
      project: filter.projectId
        ? {
            where: {
              id: Number(filter.projectId),
            },
          }
        : true,
      sectionAttributeValues: {
        include: {
          attribute: {
            include: {
              options: true,
            },
          },
        },
      },
      globalAttributeValues: {
        include: {
          attribute: {
            include: {
              options: true,
            },
          },
        },
      },
      reclaims: true,
      authority: true,
      studio: filter.cargoStudioId
        ? {
            where: {
              id: Number(filter.cargoStudioId),
            },
          }
        : true,
      responsible: filter.responsibleId
        ? {
            where: {
              id: Number(filter.responsibleId),
            },
          }
        : true,
      situation: true,
      stepData: {
        include: {
          step: {
            include: {
              instance: true,
            },
          },
        },
      },
    };

    const { results, page, totalPages, total, pageSize } =
      await CustomPaginationService._getPaginationModel(
        this.prisma,
        EntityReferenceModel.Supervision,
        {
          page: filter.page,
          pageSize: filter.pageSize,
          whereFields,
          includeConditions,
          search: filter.search,
        },
        searchableFields,
      );

    const filterSupervision = await Promise.all(
      results.map(async (supervision) => {
        const filterIds: number[] =
          supervision?.plaintiff.split(", ").map((v) => Number(v)) ?? [];

        const plaintiffs = await this.prisma.masterOption.findMany({
          where: {
            id: {
              in: filterIds.map((id) => id),
            },
          },
        });

        return {
          ...supervision,
          plaintiff: plaintiffs.map((v) => v.name).join(", "),
        };
      }),
    );

    return {
      results: filterSupervision,
      page,
      totalPages,
      pageSize,
      total,
    };
  }

  async getSupervision(id: number) {
    return this.prisma.supervision.findFirst({
      where: {
        id,
      },
      include: {
        reclaims: true,
      },
    });
  }

  async exportWord(entityReference: string) {
    try {
      const bufferLogo = readFileSync(
        `${process.cwd()}/dist/public/img/Anglo_American_Logo_RGB_4C.png`,
      );
      const supervision = await this.prisma.supervision.findFirst({
        where: {
          entityReference,
        },
        include: {
          sectionAttributeValues: {
            where: {
              supervision: {
                entityReference,
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
              supervision: {
                entityReference,
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
          project: true,
          responsible: true,
          studio: true,
          secondaryResponsible: true,
        },
      });

      const historicalVersion =
        await UtilsService._getHistoricalByEntityReference(
          this.prisma,
          entityReference,
          ModelType.Supervision,
        );

      const lastSituation = UtilsService._getModuleAttributeWithValueBySlug(
        supervision as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.supervisionLastSituation,
        ExtendedAttributeConfig.sectionAttributeValues,
      );

      const resume = UtilsService._getModuleAttributeWithValueBySlug(
        supervision as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.supervisionResume,
        ExtendedAttributeConfig.sectionAttributeValues,
      );

      const cause = UtilsService._getModuleAttributeOptionLabelBySlug(
        supervision as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.supervisionCause,
        ExtendedAttributeConfig.sectionAttributeValues,
      );

      const sede = UtilsService._getModuleAttributeOptionLabelBySlug(
        supervision as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.supervisionSede,
        ExtendedAttributeConfig.sectionAttributeValues,
      );

      const startDate = UtilsService._getModuleAttributeWithValueBySlug(
        supervision as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.supervisionStartDate,
        ExtendedAttributeConfig.sectionAttributeValues,
      );

      const criticalProcess = UtilsService._getModuleAttributeOptionLabelBySlug(
        supervision as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.supervisionCriticalProcess,
        ExtendedAttributeConfig.sectionAttributeValues,
      );

      const principalSituation =
        UtilsService._getModuleAttributeWithValueBySlug(
          supervision as unknown as GetModuleAttributeValueDto,
          AttributeSlugConfig.supervisionPrincipalSituation,
          ExtendedAttributeConfig.sectionAttributeValues,
        );

      const comments = UtilsService._getModuleAttributeWithValueBySlug(
        supervision as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.supervisionComments,
        ExtendedAttributeConfig.globalAttributeValues,
      );

      const lawyerEmail = UtilsService._getModuleAttributeWithValueBySlug(
        supervision as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.supervisionLawyerEmail,
        ExtendedAttributeConfig.sectionAttributeValues,
      );

      const plaintiffs = await UtilsService.getPlaintiffs(
        supervision?.plaintiff,
        this.prisma,
      );

      const rows = [
        AngloMultipleTableHeaderCell("Criterios claves", "Detalle"),
        new TableRow({
          children: AngloTableCell("ID Expediente", supervision.fileCode),
        }),
        new TableRow({
          children: AngloTableCell("Materia", supervision.controversialMatter),
        }),
        new TableRow({
          children: AngloTableCell(
            "Sujeto demandado",
            `${plaintiffs} / ${supervision.demanded}`,
          ),
        }),
        new TableRow({
          children: AngloTableCell("Breve resumen del caso", resume),
        }),
        new TableRow({
          children: AngloTableCell("Sede", sede),
        }),
        new TableRow({
          children: AngloTableCell("Último actuado", lastSituation),
        }),
        new TableRow({
          children: AngloTableCell("Causa / Raíz", cause),
        }),
        new TableRow({
          children: AngloTableCell("Fecha de inicio del proceso", startDate),
        }),
        new TableRow({
          children: AngloTableCell("Criticidad del proceso", criticalProcess),
        }),
        new TableRow({
          children: AngloTableCell(
            "Nivel de contingencia",
            capitalize(supervision.contingencyLevel),
          ),
        }),
        new TableRow({
          children: AngloTableCell(
            "Monto demandado",
            `S/. ${supervision.amount}`,
          ),
        }),
        new TableRow({
          children: AngloTableCell(
            "Monto pagado",
            `S/. ${supervision.provisionAmount}`,
          ),
        }),
        new TableRow({
          children: AngloTableCell("Correo de abogado", `${lawyerEmail}`),
        }),
      ];

      const table = new Table({
        rows: rows,
        columnWidths: [4505, 4505],
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.AUTOFIT,
      });

      const tableComments = new Table({
        rows: [
          AngloSingleTableHeaderCell("Comentarios", "347ff6"),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(comments)],
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 100, bottom: 100 },
              }),
            ],
          }),
        ],
        columnWidths: [9010],
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.AUTOFIT,
      });

      const tablePrincipalSituation = new Table({
        rows: [
          AngloSingleTableHeaderCell("Principales Actuados", "347ff6"),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(principalSituation)],
              }),
            ],
          }),
        ],
        columnWidths: [9010],
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.AUTOFIT,
      });

      const tableTitle = new Table({
        rows: [
          AngloSingleTableHeaderCell("FICHA DE RESUMEN DE PROCESOS", "031795"),
        ],
        columnWidths: [9010],
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.AUTOFIT,
      });

      const rowsHistorical = [];

      for (const historical of historicalVersion) {
        const row = new TableRow({
          children: AngloTableCell(
            historical.sectionAttribute.attribute.label,
            historical.oldValue,
          ),
        });

        rowsHistorical.push(row);
      }

      const rowsVersionHistorical = [
        AngloSingleTableHeaderCell("Historial de versiones", "347ff6"),
        ...rowsHistorical,
      ];

      const tableVersionHistorical = new Table({
        rows: rowsVersionHistorical,
        columnWidths: [4505, 4505],
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.AUTOFIT,
      });

      const doc = new Document({
        sections: [
          {
            headers: {
              default: angloDocHeader(bufferLogo),
            },
            children: [],
          },
          {
            children: [
              tableTitle,
              table,
              tableComments,
              tablePrincipalSituation,
              tableVersionHistorical,
            ],
          },
        ],
      });

      return Packer.toBuffer(doc);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async exportExcel() {
    const supervisions = await this.prisma.supervision.findMany({
      where: {
        isActive: true,
      },
      include: {
        responsible: true,
        project: true,
        authority: true,
        situation: true,
        sectionAttributeValues: {
          include: {
            attribute: {
              include: {
                options: true,
              },
            },
          },
        },
        globalAttributeValues: {
          include: {
            attribute: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    const headers = [
      { key: "project.name", header: "Proyecto" },
      { key: "authority.name", header: "Estudio" },
      { key: "situation.name", header: "Situación" },
      { key: "responsible.displayName", header: "Responsable" },
    ];

    for (const item of supervisions) {
      item.globalAttributeValues?.forEach((attribute, index) => {
        const findIndex = attribute.attribute.options.findIndex(
          (option) => option.optionValue === attribute.value,
        );

        if (
          attribute.attribute.dataType === DataType.LIST &&
          findIndex !== -1
        ) {
          headers.push({
            key: `globalAttributeValues[${index}].attribute.options[${findIndex}].optionLabel`,
            header: `${attribute.attribute.label}`,
          });
        } else {
          headers.push({
            key: `globalAttributeValues[${index}].value`,
            header: `${attribute.attribute.label}`,
          });
        }
      });

      item.sectionAttributeValues?.forEach((attribute, index) => {
        const findIndex = attribute.attribute.options.findIndex(
          (option) => option.optionValue === attribute.value,
        );

        if (
          attribute.attribute.dataType === DataType.LIST &&
          findIndex !== -1
        ) {
          headers.push({
            key: `sectionAttributeValues[${index}].attribute.options[${findIndex}].optionLabel`,
            header: `${attribute.attribute.label}`,
          });
        } else {
          headers.push({
            key: `sectionAttributeValues[${index}].value`,
            header: `${attribute.attribute.label}`,
          });
        }
      });
    }

    const flattenedProcesses = supervisions.map((process) =>
      headers.reduce((acc, { key }) => {
        acc[key] = UtilsService.getNestedValue(process, key);
        return acc;
      }, {}),
    );

    try {
      return ExportablesService.generateExcel(headers, flattenedProcesses);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async toggleSupervision(supervision: ToggleJudicialProcessDto) {
    if (!supervision.id) {
      throw new BadRequestException(
        "Debe ingresar un ID correspondiente, para la activación o desactivación del expediente.",
      );
    }

    return this.prisma.supervision.update({
      data: {
        isActive: !supervision.isActive,
      },
      where: {
        id: supervision.id,
      },
    });
  }
}
