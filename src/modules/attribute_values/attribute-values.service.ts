import { BadRequestException, Injectable } from "@nestjs/common";
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

  async getSectionBySlug(pathname: string) {
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
            values: true,
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
}
