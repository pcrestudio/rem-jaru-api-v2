import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { CreateJudicialProcessDto } from "./dto/create-judicial-process.dto";
import { EditJudicialProcessDto } from "./dto/edit-judicial-process.dto";
import { ToggleJudicialProcessDto } from "./dto/toggle-judicial-process.dto";
import { FilterJudicialProcessDto } from "./dto/filter-judicial-process.dto";
import { CustomPaginationService } from "../custom_pagination/custom_pagination.service";
import { ExportablesService } from "../exportables/exportables.service";
import { EntityReferenceModel } from "../../common/utils/entity_reference_mapping";
import { AttributeSlugConfig } from "../../config/attribute-slug.config";
import { UtilsService } from "../../utils/utils.service";
import { GetModuleAttributeValueDto } from "../../utils/dto/get-module-attribute.value.dto";
import { ExtendedAttributeConfig } from "../../config/extended-attribute.config";
import { DataType } from "@prisma/client";
import { searchableFields } from "../../config/submodule_searchableFields";
import capitalize from "../../utils/capitalize";
import formatDateToLocale from "../../common/utils/format_date";
import { MailService } from "../../shared/mail/mail.service";
import createJudicialProcessTemplate from "./templates/create-judicial-process.tpl";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { MasterStatusConfig } from "../../config/master-status.config";
import finishedJudicialProcessTemplate from "./templates/finished-judicial-process.tpl";

@Injectable()
export class JudicialProcessService {
  constructor(
    private prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

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
        statusId: Number(judicialProcess.statusId),
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

    const getStatus = await UtilsService._getStatus(
      Number(judicialProcess.statusId),
      this.prisma,
    );

    if (getStatus === MasterStatusConfig.concluido) {
      await this.mail.sendWithTemplate(
        finishedJudicialProcessTemplate,
        {
          fileCode: judicialProcess.fileCode,
          studio: await UtilsService._getStudio(
            judicialProcess.cargoStudioId,
            this.prisma,
          ),
        },
        [
          ...UtilsService.getRecipientsEmail(
            this.config.get("EMAIL_RECIPIENT").toString(),
          ),
        ],
        "Proceso concluido.",
      );
    }

    try {
      const result = await this.prisma.judicialProcess.update({
        data: {
          fileCode: judicialProcess.fileCode,
          demanded: judicialProcess.demanded,
          plaintiff: judicialProcess.plaintiff,
          coDefendant: judicialProcess.coDefendant,
          controversialMatter: judicialProcess.controversialMatter,
          contingencyLevel: judicialProcess.contingencyLevel,
          contingencyPercentage: judicialProcess.contingencyPercentage,
          provisionAmount: Number(judicialProcess.provisionAmount),
          paidAmount: Number(judicialProcess.paidAmount),
          savingAmount: Number(judicialProcess.savingAmount),
          provisionContingency: Number(judicialProcess.provisionContingency),
          comment: judicialProcess?.comment,
          isProvisional:
            judicialProcess.isProvisional === "false" ? false : true,
          projectId: Number(judicialProcess.projectId),
          amount: Number(judicialProcess.amount),
          cargoStudioId: Number(judicialProcess.cargoStudioId),
          statusId: Number(judicialProcess.statusId),
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

      return result;
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
      status: filter.statusId
        ? {
            where: {
              id: Number(filter.statusId),
            },
          }
        : true,
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
      const content = fs.readFileSync(
        `${process.cwd()}/dist/docs/templates/template_word.docx`,
        "binary",
      );

      const zip = new PizZip(content);

      const doc = new Docxtemplater(zip);

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
          reclaims: true,
        },
      });

      /*const historicalVersion =
        await UtilsService._getHistoricalByEntityReference(
          this.prisma,
          entityReference,
          ModelType.JudicialProcess,
        );*/

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

      const internalSpecialist =
        UtilsService._getModuleAttributeWithValueBySlug(
          judicialProcess as unknown as GetModuleAttributeValueDto,
          AttributeSlugConfig.internalSpecialist,
          ExtendedAttributeConfig.sectionAttributeValues,
        );

      const commentsForResult = UtilsService._getModuleAttributeWithValueBySlug(
        judicialProcess as unknown as GetModuleAttributeValueDto,
        AttributeSlugConfig.commentsForResult,
        ExtendedAttributeConfig.sectionAttributeValues,
      );

      const sumAmount = judicialProcess?.reclaims.reduce(
        (sum, acc) => sum + Number(acc.amount),
        0,
      );

      const sumProvisionAmount = judicialProcess?.reclaims.reduce(
        (sum, acc) => sum + Number(acc.provisionAmount),
        0,
      );

      const sumPosibleAmount = judicialProcess?.reclaims.reduce(
        (sum, acc) => sum + Number(acc.posibleAmount),
        0,
      );

      const sumRemoteAmount = judicialProcess?.reclaims.reduce(
        (sum, acc) => sum + Number(acc.remoteAmount),
        0,
      );

      const sumContingencyPercentage = judicialProcess?.reclaims.reduce(
        (sum, acc) => sum + Number(acc.contingencyPercentage),
        0,
      );

      const lastItemArray = judicialProcess?.reclaims.slice(-1)[0];

      const exportableWordData = {
        fileCode: judicialProcess?.fileCode,
        matter: judicialProcess?.submodule.name,
        plaintiff: judicialProcess?.plaintiff,
        demanded: judicialProcess?.demanded,
        coDefendant: judicialProcess?.coDefendant,
        resume,
        sede,
        lastSituation,
        cause,
        startDate: formatDateToLocale(startDate),
        criticalProcess,
        contingencyLevel: judicialProcess?.contingencyLevel
          ? capitalize(judicialProcess?.contingencyLevel)
          : "-",
        amount: `S/. ${judicialProcess?.amount}`,
        provisionAmount: `S/. ${judicialProcess?.provisionAmount}`,
        internalSpecialist,
        principalSituation,
        comments: commentsForResult,
        reclaims: judicialProcess?.reclaims.map((reclaim) => ({
          concept: reclaim.concept,
          amount: `S/. ${reclaim.amount}`,
          provisionAmount: `S/. ${reclaim.provisionAmount}`,
          contingencyPercentage: `${reclaim.contingencyPercentage}%`,
          remoteAmount: `S/. ${reclaim.remoteAmount}`,
          posibleAmount: `S/. ${reclaim.posibleAmount}`,
          contingencyLevel: capitalize(reclaim.contingencyLevel),
        })),
        updatedAt: formatDateToLocale(judicialProcess?.updatedAt.toString()),
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

  async exportExcel() {
    const judicialProcesses = await this.prisma.judicialProcess.findMany({
      where: {
        isActive: true,
      },
      include: {
        responsible: true,
        studio: true,
        project: true,
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
      {
        key: "controversialMatter",
        header: "Moneda",
      },
      { key: "project.name", header: "Razón social" },
      { key: "studio.name", header: "Estudio" },
      { key: "contingencyLevel", header: "Nivel de contingencia" },
      { key: "contingencyPercentage", header: "% de contingencia" },
      { key: "amount", header: "Monto demandado" },
      { key: "provisionAmount", header: "Monto de provisión" },
      { key: "paidAmount", header: "Monto pagado" },
      { key: "savingAmount", header: "Ahorro generado" },
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
