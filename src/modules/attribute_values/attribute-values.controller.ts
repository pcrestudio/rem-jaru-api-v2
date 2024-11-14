import { Body, Controller, Get, Patch, Post, Query, Req } from "@nestjs/common";
import { Request } from "express";
import { AttributeValuesService } from "./attribute-values.service";
import { CreateSectionDto } from "./dto/create-section.dto";
import { CreateSectionAttributeDto } from "./dto/create-section-attribute.dto";
import { CreateSectionAttributeOptionDto } from "./dto/create-section-attribute-option.dto";
import { EditSectionAttributeOptionDto } from "./dto/edit-section-attribute-option.dto";
import { EditSectionAttributeDto } from "./dto/edit-section-attribute.dto";
import { CreateSectionAttributeValueGroup } from "./dto/create-section-attribute-value.dto";

interface SectionQuery {
  moduleId: string;
  submoduleId: string;
}

@Controller("extended")
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

  @Post("attribute/values")
  async createSectionAttributeValue(
    @Body() sectionAttributeValues: CreateSectionAttributeValueGroup,
    @Req() req: Request,
  ) {
    return this.attributeValuesService.createSectionAttributeValue(
      sectionAttributeValues,
      req,
    );
  }

  @Patch("section/attribute")
  async editSectionAttribute(
    @Body() sectionAttribute: EditSectionAttributeDto,
  ) {
    return this.attributeValuesService.editSectionAttribute(sectionAttribute);
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

  @Get("section/attributes")
  async getSectionBySlug(
    @Query("slug") slug: string,
    @Query("entityReference") entityReference: string,
  ) {
    return this.attributeValuesService.getSectionBySlug(slug, entityReference);
  }

  @Get("options")
  async getSectionAttributeOptions(@Query("attributeId") attributeId: string) {
    return this.attributeValuesService.getSectionAttributeOptions(
      Number(attributeId),
    );
  }
}
