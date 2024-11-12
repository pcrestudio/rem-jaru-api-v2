import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateSectionDto } from "./dto/create-section.dto";
import {
  CreateSectionAttributeDto,
  DataType,
} from "./dto/create-section-attribute.dto";
import { CreateSectionAttributeOptionDto } from "./dto/create-section-attribute-option.dto";
import { EditSectionAttributeOptionDto } from "./dto/edit-section-attribute-option.dto";

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
        moduleId: section.moduleId ?? undefined,
        submoduleId: section.submoduleId ?? undefined,
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

  async getSections(sectionId?: number, submoduleId?: number) {
    return this.prisma.section.findMany({
      where: {
        OR: [
          {
            moduleId: sectionId,
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

  async getSectionAttributeOptions(attributeId: number) {
    return this.prisma.sectionAttributeOption.findMany({
      where: {
        attributeId,
      },
    });
  }
}
