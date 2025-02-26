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
import { UtilsService } from "../../utils/utils.service";
import { GetModuleAttributeValueDto } from "../../utils/dto/get-module-attribute.value.dto";
import { AttributeSlugConfig } from "../../config/attribute-slug.config";
import { ExtendedAttributeConfig } from "../../config/extended-attribute.config";
import { DataType } from "@prisma/client";
import { ExportablesService } from "../exportables/exportables.service";
import { searchableFields } from "../../config/submodule_searchableFields";
import { ToggleJudicialProcessDto } from "../judicial_process/dto/toggle-judicial-process.dto";
import capitalize from "../../utils/capitalize";
import formatDateToLocale from "../../common/utils/format_date";
import * as fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

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
          paidAmount: Number(supervision.paidAmount),
          savingAmount: Number(supervision.savingAmount),
          provisionContingency: Number(supervision.provisionContingency),
          comment: supervision.comment,
          amount: Number(supervision.amount),
          authorityId: Number(supervision.authorityId),
          cargoStudioId: Number(supervision.cargoStudioId),
          situationId: Number(supervision.situationId),
          responsibleId: Number(supervision.responsibleId),
          statusId: Number(supervision.statusId),
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
      include: {
        reclaims: true,
      },
    });
  }

  async exportWord(entityReference: string) {
    try {
      const content = fs.readFileSync(
        `${process.cwd()}/docs/templates/template_word.docx`,
        "binary",
      );

      const zip = new PizZip(content);

      const doc = new Docxtemplater(zip);

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
          reclaims: true,
          studio: true,
          secondaryResponsible: true,
          submodule: true,
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
        AttributeSlugConfig.supervisionCommentsForResult,
        ExtendedAttributeConfig.globalAttributeValues,
      );

      const internalSpecialist =
        UtilsService._getModuleAttributeWithValueBySlug(
          supervision as unknown as GetModuleAttributeValueDto,
          AttributeSlugConfig.supervisionInternalSpecialist,
          ExtendedAttributeConfig.sectionAttributeValues,
        );

      const sumAmount = supervision?.reclaims.reduce(
        (sum, acc) => sum + Number(acc.amount),
        0,
      );

      const sumProvisionAmount = supervision?.reclaims.reduce(
        (sum, acc) => sum + Number(acc.provisionAmount),
        0,
      );

      const sumPosibleAmount = supervision?.reclaims.reduce(
        (sum, acc) => sum + Number(acc.posibleAmount),
        0,
      );

      const sumRemoteAmount = supervision?.reclaims.reduce(
        (sum, acc) => sum + Number(acc.remoteAmount),
        0,
      );

      const sumContingencyPercentage = supervision?.reclaims.reduce(
        (sum, acc) => sum + Number(acc.contingencyPercentage),
        0,
      );

      const lastItemArray = supervision?.reclaims.slice(-1)[0];

      const exportableWordData = {
        fileCode: supervision?.fileCode,
        matter: supervision?.submodule.name,
        plaintiff: supervision?.plaintiff,
        demanded: supervision?.demanded,
        coDefendant: supervision?.coDefendant,
        resume,
        sede,
        lastSituation,
        cause,
        startDate: formatDateToLocale(startDate),
        criticalProcess,
        contingencyLevel: supervision?.contingencyLevel
          ? capitalize(supervision?.contingencyLevel)
          : "-",
        amount: `S/. ${supervision?.amount}`,
        provisionAmount: `S/. ${supervision?.provisionAmount}`,
        internalSpecialist,
        principalSituation,
        comments: comments,
        reclaims: supervision?.reclaims.map((reclaim) => ({
          concept: reclaim.concept,
          amount: `S/. ${reclaim.amount}`,
          provisionAmount: `S/. ${reclaim.provisionAmount}`,
          contingencyPercentage: `${reclaim.contingencyPercentage}%`,
          remoteAmount: `S/. ${reclaim.remoteAmount}`,
          posibleAmount: `S/. ${reclaim.posibleAmount}`,
          contingencyLevel: capitalize(reclaim.contingencyLevel),
        })),
        updatedAt: formatDateToLocale(supervision?.updatedAt.toString()),
        sumAmount: `S/. ${Number(sumAmount).toFixed(2)}`,
        sumProvisionAmount: `S/. ${Number(sumProvisionAmount).toFixed(2)}`,
        sumRemoteAmount: `S/. ${Number(sumRemoteAmount).toFixed(2)}`,
        sumPosibleAmount: `S/. ${Number(sumPosibleAmount).toFixed(2)}`,
        sumContingencyPercentage: `${Math.round(sumContingencyPercentage)}%`,
        lastContingencyLevel: capitalize(lastItemArray?.contingencyLevel),
      };

      doc.render(exportableWordData);

      return doc.getZip().generate({ type: "nodebuffer" });
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
        submodule: true,
        status: true,
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
      {
        key: "submodule.name",
        header: "Materia",
      },
      {
        key: "status.name",
        header: "Status",
      },
      { key: "fileCode", header: "Código de expediente" },
      { key: "demanded", header: "Demandante" },
      { key: "plaintiff", header: "Demandado" },
      { key: "coDefendant", header: "Co-demandado" },
      { key: "responsible.displayName", header: "Responsable" },
      {
        key: "secondaryResponsible.displayName",
        header: "Responsable Secundario",
      },
      { key: "project.name", header: "Razón social" },
      { key: "studio.name", header: "Estudio" },
      { key: "authority.name", header: "Estudio" },
      { key: "situation.name", header: "Situación" },
      {
        key: "controversialMatter",
        header: "Moneda",
      },
      { key: "contingencyLevel", header: "Nivel de contingencia" },
      { key: "contingencyPercentage", header: "% de contingencia" },
      { key: "amount", header: "Monto demandado" },
      { key: "provisionAmount", header: "Monto de provisión" },
      { key: "paidAmount", header: "Monto pagado" },
      { key: "savingAmount", header: "Ahorro generado" },
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
