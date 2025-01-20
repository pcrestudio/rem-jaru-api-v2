import {
  GetModuleAttributeDto,
  GetModuleAttributeValueDto,
} from "./dto/get-module-attribute.value.dto";
import { DataType } from "../modules/attribute_values/dto/get-section-attributes.dto";
import { GetHistoricalValueDto } from "./dto/get-historical-value.dto";
import { AttributeSlugConfig } from "../config/attribute-slug.config";
import { PrismaClient } from "@prisma/client";
import { ModelType } from "../common/utils/entity_reference_mapping";

export class UtilsService {
  static _getModuleAttributeWithValueBySlug(
    module: GetModuleAttributeValueDto,
    slug: string,
    extendedAttributeType: string,
  ): string {
    const findAttribute = module[`${extendedAttributeType}`].find(
      (attributeValue) => attributeValue.attribute.slug === slug,
    );

    if (!findAttribute) {
      return "";
    }

    return findAttribute.value;
  }

  static _getModuleAttributeOptionLabelBySlug(
    module: GetModuleAttributeValueDto,
    slug: string,
    extendedAttributeType: string,
  ): string {
    const findAttribute = module[`${extendedAttributeType}`].find(
      (attributeValue) => attributeValue.attribute.slug === slug,
    );

    if (!findAttribute) {
      return "";
    }

    const option = findAttribute.attribute.options.find(
      (option) => option.optionValue === findAttribute.value,
    );

    if (!option) {
      return "";
    }

    return option.optionLabel;
  }

  static _getAttributeWithValueBySlug(
    module: GetModuleAttributeValueDto,
    extendedAttributeType: string,
    index,
  ): string {
    const findAttribute = module[`${extendedAttributeType}`][
      index
    ] as GetModuleAttributeDto;

    if (!findAttribute || !findAttribute.attribute) {
      return "";
    }

    if (findAttribute.attribute.dataType === DataType.LIST) {
      const option = findAttribute.attribute.options?.find(
        (option) => option.optionValue === findAttribute.value,
      );

      return option ? option.optionLabel : "";
    }

    return findAttribute.value || "";
  }

  static _getHistoricalValue(
    historical: GetHistoricalValueDto[],
    extendedAttributeType: string,
  ) {
    if (!historical) {
      return "";
    }

    const findHistoricalAttribute = historical.find(
      (attribute) =>
        attribute.sectionAttribute.attribute.slug === extendedAttributeType,
    );

    return findHistoricalAttribute ? findHistoricalAttribute.oldValue : "";
  }

  static async _getHistoricalByEntityReference(
    prisma: PrismaClient,
    entityReference: string,
    modelType: string,
  ) {
    const getEntityReference =
      modelType === ModelType.JudicialProcess
        ? { entityJudicialProcessReference: entityReference }
        : { entitySupervisionReference: entityReference };

    return prisma.sectionAttributeValueHistory.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                sectionAttribute: getEntityReference,
              },
            ],
          },
          {
            OR: [
              {
                sectionAttribute: {
                  attribute: {
                    slug:
                      modelType === ModelType.JudicialProcess
                        ? AttributeSlugConfig.lastSituation
                        : AttributeSlugConfig.supervisionLastSituation,
                  },
                },
              },
              {
                sectionAttribute: {
                  attribute: {
                    slug:
                      modelType === ModelType.JudicialProcess
                        ? AttributeSlugConfig.lastDate
                        : AttributeSlugConfig.lastDate,
                  },
                },
              },
              {
                sectionAttribute: {
                  attribute: {
                    slug:
                      modelType === ModelType.JudicialProcess
                        ? AttributeSlugConfig.nextSituation
                        : AttributeSlugConfig.supervisionNextSituation,
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        sectionAttribute: {
          include: {
            attribute: {
              include: {
                values: true,
              },
            },
          },
        },
      },
    });
  }
}
