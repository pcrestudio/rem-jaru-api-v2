import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { CreateSupervisionDto } from "./dto/create-supervision.dto";
import { CustomPaginationService } from "../custom_pagination/custom_pagination.service";
import { EntityReferenceModel } from "../../common/utils/entity_reference_mapping";
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
  TableRow,
  WidthType,
} from "docx";
import AngloTableCell from "../../common/utils/anglo_table_cell";
import AngloSingleTableHeaderCell from "../../common/utils/anglo_table_single_header_cell";
import { angloDocHeader } from "../../common/utils/anglo_doc_header";
import { DataType } from "@prisma/client";
import { ExportablesService } from "../exportables/exportables.service";

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
        authorityId: supervision.authorityId,
        situationId: supervision.situationId,
        projectId: supervision.projectId,
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
          authorityId: Number(supervision.authorityId),
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

    const searchableFields = ["authority.name"];

    const whereFields = {
      submoduleId: submodule?.id,
    };

    if (filter.projectId) {
      whereFields["projectId"] = Number(filter.projectId);
    }

    const includeConditions: any = {
      project: filter.projectId
        ? {
            where: {
              id: Number(filter.projectId),
            },
          }
        : true,
      sectionAttributeValues: true,
      globalAttributeValues: true,
      authority: true,
      responsible: true,
      situation: true,
      stepData: true,
    };

    return CustomPaginationService._getPaginationModel(
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
  }

  async getSupervision(id: number) {
    return this.prisma.supervision.findFirst({
      where: {
        id,
      },
    });
  }

  async exportWord(entityReference: string) {
    try {
      const bufferLogo = readFileSync(
        `${process.cwd()}/public/img/Anglo_American_Logo_RGB_4C.png`,
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
        },
      });

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

      const successRate = UtilsService._getModuleAttributeOptionLabelBySlug(
        supervision as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.supervisionSuccessRate,
        ExtendedAttributeConfig.sectionAttributeValues,
      );

      const actualState = UtilsService._getModuleAttributeOptionLabelBySlug(
        supervision as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.supervisionActualState,
        ExtendedAttributeConfig.sectionAttributeValues,
      );

      const principalSituation =
        UtilsService._getModuleAttributeWithValueBySlug(
          supervision as unknown as GetModuleAttributeValueDto,
          AttributeSlugConfig.supervisionPrincipalSituation,
          ExtendedAttributeConfig.sectionAttributeValues,
        );

      const contingencyLevel =
        UtilsService._getModuleAttributeOptionLabelBySlug(
          supervision as unknown as GetModuleAttributeValueDto,
          AttributeSlugConfig.supervisionContingencyLevel,
          ExtendedAttributeConfig.sectionAttributeValues,
        );

      const provisionAmount = UtilsService._getModuleAttributeWithValueBySlug(
        supervision as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.supervisionProvisionAmount,
        ExtendedAttributeConfig.globalAttributeValues,
      );

      const payAmount = UtilsService._getModuleAttributeWithValueBySlug(
        supervision as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.supervisionPayAmount,
        ExtendedAttributeConfig.sectionAttributeValues,
      );

      const comments = UtilsService._getModuleAttributeWithValueBySlug(
        supervision as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.supervisionComments,
        ExtendedAttributeConfig.globalAttributeValues,
      );

      const rows = [
        AngloMultipleTableHeaderCell("Criterios claves", "Detalle"),
        new TableRow({
          children: AngloTableCell("Breve resumen del caso", resume),
        }),
        new TableRow({
          children: AngloTableCell("Estado actual", actualState),
        }),
        new TableRow({
          children: AngloTableCell("Último actuado", lastSituation),
        }),
        new TableRow({
          children: AngloTableCell("Indicador de éxito", successRate),
        }),
        new TableRow({
          children: AngloTableCell("Nivel de contingencia", contingencyLevel),
        }),
        new TableRow({
          children: AngloTableCell("Monto demandado", `S/. ${provisionAmount}`),
        }),
        new TableRow({
          children: AngloTableCell("Monto pagado", `S/. ${payAmount}`),
        }),
      ];

      const table = new Table({
        rows: rows,
        columnWidths: [4505, 4505],
        width: { size: 100, type: WidthType.PERCENTAGE },
      });

      const tableComments = new Table({
        rows: [
          AngloSingleTableHeaderCell("Comentarios", "347ff6"),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(comments)],
              }),
            ],
          }),
        ],
        columnWidths: [9010],
        width: { size: 100, type: WidthType.PERCENTAGE },
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
      });

      const tableTitle = new Table({
        rows: [
          AngloSingleTableHeaderCell("FICHA DE RESUMEN DE PROCESOS", "031795"),
        ],
        columnWidths: [9010],
        width: { size: 100, type: WidthType.PERCENTAGE },
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
        acc[key] = this.getNestedValue(process, key);
        return acc;
      }, {}),
    );

    try {
      return ExportablesService.generateExcel(headers, flattenedProcesses);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  private getNestedValue(obj: any, key: string) {
    return key.split(".").reduce((o, k) => {
      if (k.includes("[") && k.includes("]")) {
        const [arrayKey, index] = k.split(/[\[\]]/).filter(Boolean);

        if (arrayKey === "attribute" && o?.[arrayKey]?.options) {
          const option = o[arrayKey].options.find(
            (option: any) => option.optionValue === o?.value,
          );

          return option ? option.optionLabel : "";
        }

        return o?.[arrayKey]?.[parseInt(index, 10)] ?? "";
      }

      return o?.[k] ?? "";
    }, obj);
  }
}
