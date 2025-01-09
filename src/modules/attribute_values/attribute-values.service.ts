import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateSectionDto } from "./dto/create-section.dto";
import {
  CreateSectionAttributeDto,
  DataType,
  RowLayout,
} from "./dto/create-section-attribute.dto";
import { CreateSectionAttributeOptionDto } from "./dto/create-section-attribute-option.dto";
import { EditSectionAttributeOptionDto } from "./dto/edit-section-attribute-option.dto";
import { EditSectionAttributeDto } from "./dto/edit-section-attribute.dto";
import { mappingRevertSubmodules } from "../../common/utils/mapping_submodules";
import { CreateSectionAttributeValueGroup } from "./dto/create-section-attribute-value.dto";
import { Request } from "express";
import { ZonedDateTime } from "@internationalized/date";
import { CreateAttributeRuleDto } from "./dto/create-attribute-rule.dto";

@Injectable()
export class AttributeValuesService {
  constructor(private prisma: PrismaService) {}

  async createSectionOrGlobalAttribute(
    section: CreateSectionDto & CreateSectionAttributeDto,
  ) {
    if (!section.isSection) {
      return this.prisma.globalAttribute.create({
        data: {
          slug: section.slug,
          label: section.label,
          order: section.order,
          dataType: section.dataType ? section.dataType : DataType.TEXT,
          rowLayout: section.rowLayout ? section.rowLayout : RowLayout.single,
          moduleId: section.moduleId ?? undefined,
          submoduleId: section.submoduleId ?? undefined,
          isForReport: section.isForReport ?? false,
        },
      });
    }

    return this.prisma.section.create({
      data: {
        label: section.label,
        order: section.order,
        moduleId: section.moduleId ?? undefined,
        submoduleId: section.submoduleId ?? undefined,
        collapsable: section.collapsable,
      },
    });
  }

  async createSectionAttribute(sectionAttribute: CreateSectionAttributeDto) {
    const section = await this.prisma.section.findUnique({
      where: {
        sectionId: sectionAttribute.sectionId,
      },
    });

    return this.prisma.sectionAttribute.create({
      data: {
        ...sectionAttribute,
        dataType: sectionAttribute.dataType
          ? sectionAttribute.dataType
          : DataType.TEXT,
        rowLayout: sectionAttribute.rowLayout
          ? sectionAttribute.rowLayout
          : RowLayout.single,
        moduleId: section.moduleId ?? undefined,
        submoduleId: section.submoduleId ?? undefined,
        isForReport: sectionAttribute.isForReport ?? false,
      },
    });
  }

  async editSectionAttribute(sectionAttribute: EditSectionAttributeDto) {
    if (sectionAttribute.sectionId === 0) {
      delete sectionAttribute.sectionAttributeId;

      return this.prisma.globalAttribute.update({
        data: {
          label: sectionAttribute.label,
          slug: sectionAttribute.slug,
          order: Number(sectionAttribute.order),
          dataType: sectionAttribute.dataType
            ? sectionAttribute.dataType
            : DataType.TEXT,
          rowLayout: sectionAttribute.rowLayout
            ? sectionAttribute.rowLayout
            : RowLayout.single,
        },
        where: {
          globalAttributeId: sectionAttribute.globalAttributeId,
        },
      });
    }

    delete sectionAttribute.globalAttributeId;

    return this.prisma.sectionAttribute.update({
      data: {
        ...sectionAttribute,
      },
      where: {
        sectionAttributeId: sectionAttribute.sectionAttributeId,
      },
    });
  }

  async createSectionAttributeOption(
    sectionAttributeOption: CreateSectionAttributeOptionDto,
  ) {
    const globalAttribute = await this.prisma.globalAttribute.findFirst({
      where: {
        globalAttributeId: sectionAttributeOption.globalAttributeId ?? 0,
      },
    });

    if (globalAttribute) {
      if (globalAttribute.dataType !== DataType.LIST) {
        throw new BadRequestException(
          "El atributo global no está configurado como lista.",
        );
      }

      return this.prisma.globalAttributeOption.create({
        data: {
          optionLabel: sectionAttributeOption.optionLabel,
          optionValue: sectionAttributeOption.optionValue,
          globalAttributeId: globalAttribute.globalAttributeId,
        },
      });
    }

    const sectionAttribute = await this.prisma.sectionAttribute.findFirst({
      where: {
        sectionAttributeId: sectionAttributeOption.sectionAttributeId,
      },
    });

    if (sectionAttribute.dataType !== DataType.LIST) {
      throw new BadRequestException(
        "El atributo no está configurado como lista.",
      );
    }

    return this.prisma.sectionAttributeOption.create({
      data: {
        optionLabel: sectionAttributeOption.optionLabel,
        optionValue: sectionAttributeOption.optionValue,
        attributeId: sectionAttributeOption.sectionAttributeId,
      },
    });
  }

  async createSectionAttributeValue(
    sectionAttributeValue: CreateSectionAttributeValueGroup,
    files: Express.Multer.File[],
    userId: number,
  ) {
    try {
      this.prisma.$transaction(async (tx) => {
        for (const attribute of JSON.parse(
          sectionAttributeValue.attributes.toString(),
        )) {
          if (attribute.type === DataType.DATE) {
            if (attribute.value && typeof attribute.value === "object") {
              const zonedDateTime = new ZonedDateTime(
                attribute.value.year,
                attribute.value.month,
                attribute.value.day,
                "America/Lima",
                0,
              );

              const dateValue = zonedDateTime.toDate();

              attribute.value = dateValue.toUTCString();
            } else {
              attribute.value = null;
            }
          } else if (attribute.type === DataType.FILE) {
            const file =
              files && files.length > 0
                ? files.find((f) => f.fieldname === attribute.attributeSlug)
                : null;

            attribute.value = file ? file.filename : null;
          }

          const attributeFind = await tx.sectionAttribute.findFirst({
            where: {
              slug: attribute.attributeSlug,
            },
          });

          const userFind = await tx.user.findFirst({
            where: {
              id: userId,
            },
          });

          const sectionAttributeValueFind =
            await tx.sectionAttributeValue.findFirst({
              where: {
                sectionAttributeId: attributeFind?.sectionAttributeId,
                entityReference: sectionAttributeValue.entityReference,
              },
            });

          if (attribute.value === null) continue;

          await tx.sectionAttributeValue.upsert({
            create: {
              value: attribute.value,
              sectionAttributeId: attributeFind?.sectionAttributeId,
              createdBy: `${userFind.firstName} ${userFind.lastName}`,
              modifiedBy: "",
              entityReference: sectionAttributeValue.entityReference,
            },
            update: {
              value: attribute.value,
              createdBy: `${userFind.firstName} ${userFind.lastName}`,
              modifiedBy: `${userFind.firstName} ${userFind.lastName}`,
            },
            where: {
              sectionAttributeValueId: sectionAttributeValueFind
                ? sectionAttributeValueFind.sectionAttributeValueId
                : 0,
              sectionAttributeId: attributeFind?.sectionAttributeId,
              entityReference: sectionAttributeValue.entityReference,
            },
          });
        }
      });

      return "created";
    } catch (error) {
      console.log(error);
    }
  }

  async createGlobalAttributeValue(
    sectionAttributeValue: CreateSectionAttributeValueGroup,
    files: Express.Multer.File[],
    req: Request,
  ) {
    try {
      this.prisma.$transaction(async (tx) => {
        for (const attribute of JSON.parse(
          sectionAttributeValue.attributes.toString(),
        )) {
          if (attribute.type === DataType.DATE) {
            if (attribute.value && typeof attribute.value === "object") {
              const zonedDateTime = new ZonedDateTime(
                attribute.value.year,
                attribute.value.month,
                attribute.value.day,
                "America/Lima",
                0,
              );

              const dateValue = zonedDateTime.toDate();

              attribute.value = dateValue.toUTCString();
            } else {
              attribute.value = null;
            }
          } else if (attribute.type === DataType.FILE) {
            const file =
              files && files.length > 0
                ? files.find((f) => f.fieldname === attribute.attributeSlug)
                : null;

            attribute.value = file ? file.filename : null;
          }

          const attributeFind = await tx.globalAttribute.findFirst({
            where: {
              slug: attribute.attributeSlug,
            },
          });

          const userFind = await tx.user.findFirst({
            where: {
              id: Number(req.sub),
            },
          });

          const sectionAttributeValueFind =
            await tx.globalAttributeValue.findFirst({
              where: {
                globalAttributeId: attributeFind?.globalAttributeId,
                entityReference: sectionAttributeValue.entityReference,
              },
            });

          if (attribute.value === null) continue;

          await tx.globalAttributeValue.upsert({
            create: {
              value: attribute.value,
              globalAttributeId: attributeFind?.globalAttributeId,
              createdBy: `${userFind.firstName} ${userFind.lastName}`,
              modifiedBy: "",
              entityReference: sectionAttributeValue.entityReference,
            },
            update: {
              value: attribute.value,
              globalAttributeId: attributeFind?.globalAttributeId,
              createdBy: `${userFind.firstName} ${userFind.lastName}`,
              modifiedBy: `${userFind.firstName} ${userFind.lastName}`,
            },
            where: {
              globalAttributeValueId: sectionAttributeValueFind
                ? sectionAttributeValueFind.globalAttributeValueId
                : 0,
              globalAttributeId: attributeFind?.globalAttributeId,
              entityReference: sectionAttributeValue.entityReference,
            },
          });
        }
      });

      return "created";
    } catch (error) {
      console.log(error);
    }
  }

  async editSectionAttributeOption(
    attributeOption: EditSectionAttributeOptionDto,
  ) {
    if (
      attributeOption.globalAttributeId ||
      attributeOption.globalAttributeOptionId
    ) {
      return this.prisma.globalAttributeOption.update({
        data: {
          optionLabel: attributeOption.optionLabel,
          optionValue: attributeOption.optionValue,
        },
        where: {
          globalAttributeOptionId: attributeOption.globalAttributeOptionId,
        },
      });
    }

    return this.prisma.sectionAttributeOption.update({
      data: {
        optionLabel: attributeOption.optionLabel,
        optionValue: attributeOption.optionValue,
      },
      where: {
        sectionAttributeOptionId: attributeOption.sectionAttributeOptionId,
      },
    });
  }

  async getSections(moduleId?: number, submoduleId?: number) {
    const globalAttributes = await this.prisma.globalAttribute.findMany({
      where: {
        OR: [
          {
            moduleId: moduleId,
          },
          {
            submoduleId: submoduleId,
          },
        ],
      },
    });

    const sections = await this.prisma.section.findMany({
      where: {
        OR: [
          {
            moduleId: moduleId,
          },
          {
            submoduleId: submoduleId,
          },
        ],
      },
      include: {
        attributes: {
          include: {
            options: true,
          },
        },
      },
    });

    return [
      ...sections,
      {
        label: "General",
        collapsable: true,
        isActive: true,
        sectionId: 1000,
        moduleId: moduleId ?? null,
        submoduleId: submoduleId ?? null,
        order: sections.length + 1,
        attributes: [...globalAttributes],
      },
    ];
  }

  async getSectionBySlug(
    pathname: string,
    entityReference: string,
    isGlobal?: string,
  ) {
    const slug = pathname.split("/").filter((path) => path !== "");

    const module = await this.prisma.module.findFirst({
      where: {
        slug: slug[1],
      },
    });

    const submodule = await this.prisma.submodule.findFirst({
      where: {
        slug: mappingRevertSubmodules[slug[2]],
      },
    });

    if (isGlobal) {
      return this.prisma.globalAttribute.findMany({
        where: {
          OR: [
            {
              moduleId: module.id,
            },
            {
              submoduleId: submodule.id,
            },
          ],
        },
        include: {
          options: true,
          values: {
            where: {
              OR: [
                {
                  entityReference,
                },
              ],
            },
          },
        },
      });
    }

    return this.prisma.section.findMany({
      where: {
        OR: [
          {
            moduleId: module.id,
          },
          {
            submoduleId: submodule.id,
          },
        ],
      },
      include: {
        attributes: {
          include: {
            options: true,
            values: {
              where: {
                OR: [
                  {
                    entityReference,
                  },
                ],
              },
            },
          },
        },
      },
    });
  }

  async getAttributeOptions(attributeId: number) {
    const globalAttributeOptions =
      await this.prisma.globalAttributeOption.findMany({
        where: {
          globalAttributeId: attributeId,
        },
      });

    if (globalAttributeOptions.length > 0) {
      return globalAttributeOptions;
    }

    return this.prisma.sectionAttributeOption.findMany({
      where: {
        attributeId,
      },
    });
  }

  async getAttributeRules(sectionAttributeId: number) {
    return this.prisma.attributeRule.findMany({
      where: {
        triggerAttributeId: sectionAttributeId,
      },
      include: {
        triggerAttribute: true,
        targetAttribute: true,
      },
    });
  }

  async getAttributesByModuleOrSubmodule(
    moduleId?: number,
    submoduleId?: number,
  ) {
    return this.prisma.sectionAttribute.findMany({
      where: {
        OR: [
          {
            moduleId: moduleId,
          },
          {
            submoduleId: submoduleId,
          },
        ],
      },
    });
  }

  async upsertAttributeRule(attributeRule: CreateAttributeRuleDto) {
    try {
      await this.prisma.attributeRule.upsert({
        create: {
          triggerAttributeId: attributeRule.triggerAttributeId,
          targetAttributeId: attributeRule.targetAttributeId,
          targetValue: attributeRule.targetValue,
        },
        update: {
          triggerAttributeId: attributeRule.triggerAttributeId,
          targetAttributeId: attributeRule.targetAttributeId,
          targetValue: attributeRule.targetValue,
        },
        where: {
          id: attributeRule.id ? attributeRule.id : "",
        },
      });

      return "upsert rule";
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
