import {
  GetModuleAttributeDto,
  GetModuleAttributeValueDto,
} from "./dto/get-module-attribute.value.dto";
import { DataType } from "../modules/attribute_values/dto/get-section-attributes.dto";
import { GetHistoricalValueDto } from "./dto/get-historical-value.dto";
import { AttributeSlugConfig } from "../config/attribute-slug.config";
import { PrismaClient } from "@prisma/client";
import { ModelType } from "../common/utils/entity_reference_mapping";
import { isArray } from "class-validator";
import { Paragraph, TableCell, TableRow, VerticalAlign } from "docx";
import AngloTableCell from "../common/utils/anglo_table_cell";
import { UpsertReclaimDto } from "../modules/reclaims/dto/upsert-reclaim.dto";
import capitalize from "./capitalize";

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

    const shouldBeArray = isArray(findAttribute.value.split(", "));

    if (shouldBeArray) {
      const options = findAttribute.attribute.options;

      return options
        .filter((option) => findAttribute.value.includes(option.optionValue))
        .map((option) => option.optionLabel)
        .join(", ");
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

  static getNestedValue(obj: any, key: string) {
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

  static async getPlaintiffs(plaintiff: string, prisma: PrismaClient) {
    const filterIds: number[] =
      plaintiff
        ?.split(", ")
        .map((v) => Number(v))
        .filter((num) => !Number.isNaN(num)) ?? [];

    const plaintiffs = await prisma.masterOption.findMany({
      where: {
        id: {
          in: filterIds,
        },
      },
    });

    return plaintiffs.map((p) => p.name).join(", ");
  }

  static generateHistorical(historicalVersion: any[]) {
    const rowsHistorical = [];

    for (const historical of historicalVersion) {
      const row = new TableRow({
        children: AngloTableCell(
          historical.sectionAttribute.attribute.label,
          historical.oldValue,
        ),
      });

      rowsHistorical.push(row);
    }

    return rowsHistorical;
  }

  static generateReclaims(reclaims: UpsertReclaimDto[]) {
    const reclaimsRows = [];

    for (const reclaim of reclaims) {
      const row = new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(reclaim.concept)],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph(`S/. ${reclaim.amount.toFixed(2)}`)],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph(`${reclaim.contingencyPercentage}%`)],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph(capitalize(reclaim.contingencyLevel))],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              new Paragraph(`S./ ${reclaim.provisionAmount.toFixed(2)}`),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              new Paragraph(`S/. ${reclaim.posibleAmount.toFixed(2)}`),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph(`S/. ${reclaim.remoteAmount.toFixed(2)}`)],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      });

      reclaimsRows.push(row);
    }

    return reclaimsRows;
  }
}
