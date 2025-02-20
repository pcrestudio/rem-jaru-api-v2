import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { CreateJudicialProcessDto } from "./dto/create-judicial-process.dto";
import { EditJudicialProcessDto } from "./dto/edit-judicial-process.dto";
import { ToggleJudicialProcessDto } from "./dto/toggle-judicial-process.dto";
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
import { FilterJudicialProcessDto } from "./dto/filter-judicial-process.dto";
import { CustomPaginationService } from "../custom_pagination/custom_pagination.service";
import { ExportablesService } from "../exportables/exportables.service";
import {
  EntityReferenceModel,
  ModelType,
} from "../../common/utils/entity_reference_mapping";
import { readFileSync } from "fs";
import { angloDocHeader } from "../../common/utils/anglo_doc_header";
import AngloTableCell from "../../common/utils/anglo_table_cell";
import { AttributeSlugConfig } from "../../config/attribute-slug.config";
import { UtilsService } from "../../utils/utils.service";
import { GetModuleAttributeValueDto } from "../../utils/dto/get-module-attribute.value.dto";
import AngloMultipleTableHeaderCell, {
  tablePrincipalSituation,
  tableTitle,
} from "../../common/utils/anglo_table_header_cell";
import AngloSingleTableHeaderCell from "../../common/utils/anglo_table_single_header_cell";
import { ExtendedAttributeConfig } from "../../config/extended-attribute.config";
import { DataType } from "@prisma/client";
import { searchableFields } from "../../config/submodule_searchableFields";
import capitalize from "../../utils/capitalize";

@Injectable()
export class JudicialProcessService {
  constructor(private prisma: PrismaService) {}

  async createJudicialProcess(
    judicialProcess: CreateJudicialProcessDto,
    slug: string,
  ) {
    const submodule = await this.prisma.submodule.findFirst({
      where: {
        slug,
      },
    });

    const { result } = await this.prisma.$extended.judicialProcess.create({
      data: {
        fileCode: judicialProcess.fileCode,
        demanded: judicialProcess.demanded,
        plaintiff: judicialProcess.plaintiff,
        coDefendant: judicialProcess.coDefendant,
        controversialMatter: judicialProcess.controversialMatter,
        projectId: judicialProcess.projectId,
        cargoStudioId: Number(judicialProcess.cargoStudioId),
        amount: judicialProcess.amount,
        responsibleId: judicialProcess.responsibleId,
        secondaryResponsibleId: judicialProcess.secondaryResponsibleId,
        submoduleId: submodule.id,
      },
    });

    if (result) {
      await this.prisma.cEJ_Expedientes.create({
        data: {
          expedientePJ: result.fileCode,
          activo: "S",
        },
      });

      return result;
    }

    throw new InternalServerErrorException({
      message: `Error creating judicial process`,
    });
  }

  async editJudicialProcess(
    judicialProcess: EditJudicialProcessDto,
    files: Express.Multer.File[],
  ) {
    if (!judicialProcess.id) {
      throw new BadRequestException(
        "Debe ingresar un ID correspondiente, para la edición",
      );
    }

    let guaranteeLetter: string = "";

    if (files && files.length > 0) {
      const file = files.find((f) => f.fieldname === "guaranteeLetter");
      guaranteeLetter = file ? file.filename : "";
    } else if (judicialProcess.guaranteeLetter) {
      guaranteeLetter = judicialProcess.guaranteeLetter;
    }

    try {
      return this.prisma.judicialProcess.update({
        data: {
          fileCode: judicialProcess.fileCode,
          demanded: judicialProcess.demanded,
          plaintiff: judicialProcess.plaintiff,
          coDefendant: judicialProcess.coDefendant,
          controversialMatter: judicialProcess.controversialMatter,
          contingencyLevel: judicialProcess.contingencyLevel,
          contingencyPercentage: judicialProcess.contingencyPercentage,
          provisionAmount: Number(judicialProcess.provisionAmount),
          provisionContingency: Number(judicialProcess.provisionContingency),
          comment: judicialProcess?.comment,
          isProvisional:
            judicialProcess.isProvisional === "false" ? false : true,
          projectId: Number(judicialProcess.projectId),
          amount: Number(judicialProcess.amount),
          cargoStudioId: Number(judicialProcess.cargoStudioId),
          responsibleId: Number(judicialProcess.responsibleId),
          guaranteeLetter,
          secondaryResponsibleId: Number(
            judicialProcess.secondaryResponsibleId,
          ),
        },
        where: {
          id: Number(judicialProcess.id),
        },
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: `Error creating judicial process`,
        details: error.message,
      });
    }
  }

  async toggleJudicialProcess(judicialProcess: ToggleJudicialProcessDto) {
    if (!judicialProcess.id) {
      throw new BadRequestException(
        "Debe ingresar un ID correspondiente, para la activación o desactivación del expediente.",
      );
    }

    return this.prisma.judicialProcess.update({
      data: {
        isActive: !judicialProcess.isActive,
      },
      where: {
        id: judicialProcess.id,
      },
    });
  }

  async getJudicialProcesses(filter: FilterJudicialProcessDto) {
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
      responsible: filter.responsibleId
        ? {
            where: {
              id: Number(filter.responsibleId),
            },
          }
        : true,
      secondaryResponsible: true,
      studio: filter.cargoStudioId
        ? {
            where: {
              id: Number(filter.cargoStudioId),
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

    return CustomPaginationService._getPaginationModel(
      this.prisma,
      EntityReferenceModel.JudicialProcess,
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

  async getJudicialProcess(id: number) {
    return this.prisma.judicialProcess.findFirst({
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

      const judicialProcess = await this.prisma.judicialProcess.findFirst({
        where: {
          entityReference,
        },
        include: {
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
          studio: true,
          project: true,
          secondaryResponsible: true,
          responsible: true,
          submodule: true,
        },
      });

      const historicalVersion =
        await UtilsService._getHistoricalByEntityReference(
          this.prisma,
          entityReference,
          ModelType.JudicialProcess,
        );

      const lastSituation = UtilsService._getModuleAttributeWithValueBySlug(
        judicialProcess as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.lastSituation,
        ExtendedAttributeConfig.sectionAttributeValues,
      );

      const resume = UtilsService._getModuleAttributeWithValueBySlug(
        judicialProcess as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.resume,
        ExtendedAttributeConfig.sectionAttributeValues,
      );

      const cause = UtilsService._getModuleAttributeOptionLabelBySlug(
        judicialProcess as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.cause,
        ExtendedAttributeConfig.sectionAttributeValues,
      );

      const sede = UtilsService._getModuleAttributeOptionLabelBySlug(
        judicialProcess as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.sede,
        ExtendedAttributeConfig.sectionAttributeValues,
      );

      const startDate = UtilsService._getModuleAttributeWithValueBySlug(
        judicialProcess as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.startDate,
        ExtendedAttributeConfig.sectionAttributeValues,
      );

      const criticalProcess = UtilsService._getModuleAttributeOptionLabelBySlug(
        judicialProcess as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.criticalProcess,
        ExtendedAttributeConfig.sectionAttributeValues,
      );

      const principalSituation =
        UtilsService._getModuleAttributeWithValueBySlug(
          judicialProcess as unknown as GetModuleAttributeValueDto,
          AttributeSlugConfig.principalSituation,
          ExtendedAttributeConfig.sectionAttributeValues,
        );

      const lawyerEmail = UtilsService._getModuleAttributeWithValueBySlug(
        judicialProcess as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.lawyerEmail,
        ExtendedAttributeConfig.sectionAttributeValues,
      );

      const rows = [
        AngloMultipleTableHeaderCell("Criterios claves", "Detalle"),
        new TableRow({
          children: AngloTableCell("ID Expediente", judicialProcess.fileCode),
        }),
        new TableRow({
          children: AngloTableCell("Materia", judicialProcess.submodule.name),
        }),
        new TableRow({
          children: AngloTableCell(
            "Moneda",
            judicialProcess.controversialMatter,
          ),
        }),
        new TableRow({
          children: AngloTableCell(
            "Sujeto demandante",
            `${judicialProcess.plaintiff}`,
          ),
        }),
        new TableRow({
          children: AngloTableCell(
            "Sujeto demandado",
            `${judicialProcess.demanded}`,
          ),
        }),
        new TableRow({
          children: AngloTableCell(
            "Co-demandado",
            `${judicialProcess.coDefendant}`,
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
            capitalize(judicialProcess.contingencyLevel),
          ),
        }),
        new TableRow({
          children: AngloTableCell(
            "Monto demandado",
            `S/. ${judicialProcess.amount}`,
          ),
        }),
        new TableRow({
          children: AngloTableCell(
            "Monto provisionado",
            `S/. ${judicialProcess.provisionAmount}`,
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
                children: [
                  new Paragraph(
                    judicialProcess ? judicialProcess.comment : "-",
                  ),
                ],
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

      const rowsVersionHistorical = [
        AngloSingleTableHeaderCell("Historial de versiones", "347ff6"),
        ...UtilsService.generateHistorical(historicalVersion),
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
            children: [
              tableTitle,
              table,
              tableComments,
              tablePrincipalSituation(principalSituation),
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
    const judicialProcesses = await this.prisma.judicialProcess.findMany({
      where: {
        isActive: true,
      },
      include: {
        responsible: true,
        studio: true,
        project: true,
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
      { key: "fileCode", header: "Código de judicialProcess" },
      { key: "demanded", header: "Demandante" },
      { key: "plaintiff", header: "Demandado" },
      { key: "coDefendant", header: "Co-demandado" },
      { key: "responsible.displayName", header: "Responsable" },
      { key: "project.name", header: "Proyecto" },
      { key: "studio.name", header: "Estudio" },
    ];

    for (const item of judicialProcesses) {
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

    const flattenedProcesses = judicialProcesses.map((process) =>
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
}
