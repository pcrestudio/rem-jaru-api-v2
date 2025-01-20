import {
  GetModuleAttributeDto,
  GetModuleAttributeValueDto,
} from "./dto/get-module-attribute.value.dto";
import { DataType } from "../modules/attribute_values/dto/get-section-attributes.dto";

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
}
