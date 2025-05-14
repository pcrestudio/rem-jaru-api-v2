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
import { ExportablesService } from "../exportables/exportables.service";
import { searchableFields } from "../../config/submodule_searchableFields";
import { ToggleJudicialProcessDto } from "../judicial_process/dto/toggle-judicial-process.dto";
import capitalize from "../../utils/capitalize";
import formatDateToLocale from "../../common/utils/format_date";
import * as fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { MailService } from "../../shared/mail/mail.service";
import { ConfigService } from "@nestjs/config";
import createJudicialProcessTemplate from "../judicial_process/templates/create-judicial-process.tpl";
import { MasterStatusConfig } from "../../config/master-status.config";
import finishedJudicialProcessTemplate from "../judicial_process/templates/finished-judicial-process.tpl";
import { processExcelHeaders } from "../../config/excel-headers.config";
import processDate from "../../common/utils/convert_date_string";
import { format } from "date-fns";
import { DateFormat } from "../../config/date-format.config";

@Injectable()
export class SupervisionService {
  constructor(
    private prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async createSupervision(supervision: CreateSupervisionDto, slug: string) {
    const submodule = await this.prisma.submodule.findFirst({
      where: {
        slug,
      },
    });

    const endDateConclusion = processDate(supervision.endDateConclusion);

    const { result } = await this.prisma.$extended.supervision.create({
      data: {
        fileCode: supervision.fileCode,
        demanded: supervision.demanded,
        plaintiff: supervision.plaintiff,
        coDefendant: supervision.coDefendant,
        controversialMatter: supervision.controversialMatter,
        authorityId: Number(supervision.authorityId),
        situationId: Number(supervision.situationId),
        cargoStudioId: Number(supervision.cargoStudioId),
        statusId: Number(supervision.statusId),
        projectId: supervision.projectId,
        amount: Number(supervision.amount),
        responsibleId: Number(supervision.responsibleId),
        secondaryResponsibleId: Number(supervision.secondaryResponsibleId),
        endDateConclusion: endDateConclusion,
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

      const responsibleEmail = await UtilsService.getResponsibleEmail(
        Number(result.responsibleId),
        this.prisma,
      );

      await this.mail.sendWithTemplate(
        createJudicialProcessTemplate,
        {
          fileCode: result.fileCode,
          studio: await UtilsService._getStudio(
            result?.cargoStudioId,
            this.prisma,
          ),
        },
        [
          responsibleEmail,
          ...UtilsService.getRecipientsEmail(
            this.config.get("EMAIL_RECIPIENT").toString(),
          ),
        ],
        "Nuevo proceso",
      );

      return result;
    }

    throw new InternalServerErrorException({
      message: `Error creating judicial process`,
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

    const getStatus = await UtilsService._getStatus(
      Number(supervision.statusId),
      this.prisma,
    );

    const endDateConclusion = processDate(supervision.endDateConclusion);

    const responsibleEmail = await UtilsService.getResponsibleEmail(
      Number(supervision.responsibleId),
      this.prisma,
    );

    if (getStatus === MasterStatusConfig.concluido) {
      await this.mail.sendWithTemplate(
        finishedJudicialProcessTemplate,
        {
          fileCode: supervision.fileCode,
          studio: await UtilsService._getStudio(
            supervision.cargoStudioId,
            this.prisma,
          ),
        },
        [
          responsibleEmail,
          ...UtilsService.getRecipientsEmail(
            this.config.get("EMAIL_RECIPIENT").toString(),
          ),
        ],
        "Proceso concluido.",
      );
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
          secondaryResponsibleId: Number(supervision.secondaryResponsibleId),
          statusId: Number(supervision.statusId),
          projectId: Number(supervision.projectId),
          isProvisional: supervision.isProvisional === "false" ? false : true,
          endDateConclusion: endDateConclusion,
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

  async getSupervisionsBySlug(filter: FilterSupervisionDto, userId: number) {
    const isSpecialist = await this.prisma.user.findFirst({
      where: {
        id: userId,
        isSpecialist: true,
      },
    });

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

    if (isSpecialist) {
      whereFields["OR"] = [
        { responsibleId: isSpecialist.id },
        { secondaryResponsibleId: isSpecialist.id },
      ];
    } else {
      // Si no es especialista, se filtra por responsibleId solo si viene en el filtro
      if (filter.responsibleId) {
        whereFields["OR"] = [
          { responsibleId: Number(filter.responsibleId) },
          { secondaryResponsibleId: Number(filter.responsibleId) },
        ];
      }
    }

    if (filter.statusId) {
      whereFields["statusId"] = Number(filter.statusId);
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
      secondaryResponsible: true,
      situation: true,
      status: true,
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
      [...searchableFields, "situation.name.nosome", "authority.name.nosome"],
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
        `${process.cwd()}/dist/docs/templates/template_word.docx`,
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

      const internalSpecialist = supervision.responsible
        ? `${supervision?.responsible.firstName} ${supervision?.responsible.lastName}`
        : "";

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
        coDefendant: supervision?.coDefendant ?? "",
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
        lastContingencyLevel: lastItemArray?.contingencyLevel
          ? capitalize(lastItemArray?.contingencyLevel)
          : "",
      };

      doc.render(exportableWordData);

      return doc.getZip().generate({ type: "nodebuffer" });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async exportExcel(filter: FilterSupervisionDto) {
    let where = {};

    if (filter.cargoStudioId) {
      where = {
        cargoStudioId: Number(filter.cargoStudioId),
      };
    }

    const supervisions = await this.prisma.supervision.findMany({
      where: {
        isActive: true,
        ...where,
        submodule: {
          slug: filter.slug,
        },
      },
      include: {
        responsible: true,
        secondaryResponsible: true,
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
        reclaims: true,
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

    const headers: { key: string; header: string }[] = [...processExcelHeaders];
    const seenSlugs = new Set<string>();

    for (const item of supervisions) {
      item.globalAttributeValues?.forEach((attribute) => {
        const slug = attribute.attribute.slug;
        const label = attribute.attribute.label;

        if (
          slug === AttributeSlugConfig.startDate ||
          seenSlugs.has(`global-${slug}`)
        )
          return;

        seenSlugs.add(`global-${slug}`);
        headers.push({ key: `global-${slug}`, header: label });
      });

      item.sectionAttributeValues?.forEach((attribute) => {
        const slug = attribute.attribute.slug;
        const label = attribute.attribute.label;

        if (
          slug === AttributeSlugConfig.startDate ||
          seenSlugs.has(`section-${slug}`)
        )
          return;

        seenSlugs.add(`section-${slug}`);
        headers.push({ key: `section-${slug}`, header: label });
      });
    }

    const totalPosibleAmount = this.getTotalFromAmounts(
      supervisions,
      "posibleAmount",
    );

    const totalRemoteAmount = this.getTotalFromAmounts(
      supervisions,
      "remoteAmount",
    );

    const flattenedProcesses = supervisions.map((process) => {
      const flattened: Record<string, any> = {};

      for (const { key } of processExcelHeaders) {
        flattened[key] = UtilsService.getNestedValue(process, key) ?? "";
      }

      for (const { key } of headers) {
        if (key.startsWith("global-")) {
          const slug = key.replace("global-", "");
          const attribute = process.globalAttributeValues.find(
            (attr) => attr.attribute.slug === slug,
          );
          flattened[key] = attribute
            ? UtilsService.resolveAttributeValue(attribute)
            : "";
        }

        if (key.startsWith("section-")) {
          const slug = key.replace("section-", "");
          const attribute = process.sectionAttributeValues.find(
            (attr) => attr.attribute.slug === slug,
          );
          flattened[key] = attribute
            ? UtilsService.resolveAttributeValue(attribute)
            : "";
        }
      }

      // Totales
      flattened["posibleAmount"] =
        totalPosibleAmount[process.entityReference] ?? 0;

      flattened["remoteAmount"] =
        totalRemoteAmount[process.entityReference] ?? 0;

      // Fechas adicionales
      const findAttributeStartDate = process.sectionAttributeValues.find(
        (value) => value.attribute.slug === AttributeSlugConfig.startDate,
      );

      const findAttributeLastSituation = process.sectionAttributeValues.find(
        (value) => value.attribute.slug === AttributeSlugConfig.lastSituation,
      );

      const findAttributeNextSituation = process.sectionAttributeValues.find(
        (value) => value.attribute.slug === AttributeSlugConfig.nextSituation,
      );

      flattened["startDate"] = findAttributeStartDate
        ? format(findAttributeStartDate.value, DateFormat.normal)
        : "";

      flattened["modifiedAt"] =
        findAttributeLastSituation || findAttributeNextSituation
          ? format(
              new Date(
                findAttributeLastSituation?.modifiedAt?.toString() ??
                  findAttributeNextSituation?.modifiedAt?.toString(),
              ),
              DateFormat.normal,
            )
          : "";

      return flattened;
    });

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

  private getTotalFromAmounts(supervisions: any, amountType: string) {
    return supervisions.reduce((acc, process) => {
      process.reclaims.forEach((reclaim) => {
        if (!acc[reclaim.entitySupervisionReference]) {
          acc[reclaim.entitySupervisionReference] = 0;
        }
        acc[reclaim.entitySupervisionReference] += reclaim[`${amountType}`];
      });
      return acc;
    }, {});
  }
}
