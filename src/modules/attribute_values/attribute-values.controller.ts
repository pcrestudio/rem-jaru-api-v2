import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseInterceptors,
} from "@nestjs/common";
import { Request } from "express";
import { AttributeValuesService } from "./attribute-values.service";
import { CreateSectionDto } from "./dto/create-section.dto";
import { CreateSectionAttributeDto } from "./dto/create-section-attribute.dto";
import { CreateSectionAttributeOptionDto } from "./dto/create-section-attribute-option.dto";
import { EditSectionAttributeOptionDto } from "./dto/edit-section-attribute-option.dto";
import { EditSectionAttributeDto } from "./dto/edit-section-attribute.dto";
import { CreateSectionAttributeValueGroup } from "./dto/create-section-attribute-value.dto";
import { CreateAttributeRuleDto } from "./dto/create-attribute-rule.dto";
import { FileInterceptor } from "@nestjs/platform-express";

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
  @UseInterceptors(FileInterceptor("file"))
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

  @Get("attribute/rules")
  async getAttributeRules(
    @Query("sectionAttributeId") sectionAttributeId: string,
  ) {
    return this.attributeValuesService.getAttributeRules(
      Number(sectionAttributeId),
    );
  }

  @Get("attributes/module")
  async getAttributesByModuleOrSubmodule(
    @Query("moduleId") moduleId: string,
    @Query("submoduleId") submoduleId?: string,
  ) {
    return this.attributeValuesService.getAttributesByModuleOrSubmodule(
      Number(moduleId),
      Number(submoduleId),
    );
  }

  @Post("attribute/rule")
  async upsertAttributeRule(@Body() attributeRule: CreateAttributeRuleDto) {
    return this.attributeValuesService.upsertAttributeRule(attributeRule);
  }
}
