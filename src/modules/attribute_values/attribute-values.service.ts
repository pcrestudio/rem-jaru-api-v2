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

  async createSection(section: CreateSectionDto) {
    return this.prisma.section.create({
      data: {
        ...section,
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
      },
    });
  }

  async editSectionAttribute(sectionAttribute: EditSectionAttributeDto) {
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
    const sectionAttribute = await this.prisma.sectionAttribute.findFirst({
      where: {
        sectionAttributeId: sectionAttributeOption.attributeId,
      },
    });

    if (sectionAttribute.dataType !== DataType.LIST) {
      throw new BadRequestException(
        "El atributo no está configurado como lista.",
      );
    }

    return this.prisma.sectionAttributeOption.create({
      data: {
        ...sectionAttributeOption,
      },
    });
  }

  async createSectionAttributeValue(
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

          const attributeFind = await tx.sectionAttribute.findFirst({
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
            await tx.sectionAttributeValue.findFirst({
              where: {
                sectionAttributeId: attributeFind.sectionAttributeId,
                entityReference: sectionAttributeValue.entityReference,
              },
            });

          if (attribute.value === null) continue;

          await tx.sectionAttributeValue.upsert({
            create: {
              value: attribute.value,
              sectionAttributeId: attributeFind.sectionAttributeId,
              createdBy: `${userFind.firstName} ${userFind.lastName}`,
              modifiedBy: "",
              entityReference: sectionAttributeValue.entityReference,
            },
            update: {
              value: attribute.value,
              sectionAttributeId: attributeFind.sectionAttributeId,
              createdBy: `${userFind.firstName} ${userFind.lastName}`,
              modifiedBy: `${userFind.firstName} ${userFind.lastName}`,
            },
            where: {
              sectionAttributeValueId: sectionAttributeValueFind
                ? sectionAttributeValueFind.sectionAttributeValueId
                : 0,
              sectionAttributeId: attributeFind.sectionAttributeId,
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
    return this.prisma.sectionAttributeOption.update({
      data: {
        ...attributeOption,
      },
      where: {
        sectionAttributeOptionId: attributeOption.sectionAttributeOptionId,
      },
    });
  }

  async getSections(moduleId?: number, submoduleId?: number) {
    return this.prisma.section.findMany({
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
  }

  async getSectionBySlug(pathname: string, entityReference: string) {
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

  async getSectionAttributeOptions(attributeId: number) {
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
