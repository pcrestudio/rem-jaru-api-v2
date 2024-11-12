import { Body, Controller, Get, Patch, Post, Query } from "@nestjs/common";
import { AttributeValuesService } from "./attribute-values.service";
import { CreateSectionDto } from "./dto/create-section.dto";
import { CreateSectionAttributeDto } from "./dto/create-section-attribute.dto";
import { CreateSectionAttributeOptionDto } from "./dto/create-section-attribute-option.dto";
import { EditSectionAttributeOptionDto } from "./dto/edit-section-attribute-option.dto";

interface SectionQuery {
  moduleId: string;
  submoduleId: string;
}

@Controller("attribute-values")
export class AttributeValuesController {
  constructor(private attributeValuesService: AttributeValuesService) {}

  @Post("section")
  async createSection(@Body() section: CreateSectionDto) {
    return this.attributeValuesService.createSection(section);
  }

  @Post("section/attribute")
  async createSectionAttribute(
    @Body() sectionAttribute: CreateSectionAttributeDto,
  ) {
    return this.attributeValuesService.createSectionAttribute(sectionAttribute);
  }

  @Post("section/attribute/option")
  async createSectionAttributeOption(
    @Body() sectionAttributeOption: CreateSectionAttributeOptionDto,
  ) {
    return this.attributeValuesService.createSectionAttributeOption(
      sectionAttributeOption,
    );
  }

  @Patch("section/attribute/option")
  async editSectionAttributeOption(
    @Body() sectionAttributeOption: EditSectionAttributeOptionDto,
  ) {
    return this.attributeValuesService.editSectionAttributeOption(
      sectionAttributeOption,
    );
  }

  @Get("sections")
  async getSections(@Query() query: SectionQuery) {
    return this.attributeValuesService.getSections(Number(query.moduleId));
  }

  @Get("options")
  async getSectionAttributeOptions(@Query("attributeId") attributeId: string) {
    return this.attributeValuesService.getSectionAttributeOptions(
      Number(attributeId),
    );
  }
}
