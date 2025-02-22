import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { AttributeValuesService } from "./attribute-values.service";
import { CreateSectionDto } from "./dto/create-section.dto";
import { CreateSectionAttributeDto } from "./dto/create-section-attribute.dto";
import { CreateSectionAttributeOptionDto } from "./dto/create-section-attribute-option.dto";
import { EditSectionAttributeOptionDto } from "./dto/edit-section-attribute-option.dto";
import { EditSectionAttributeDto } from "./dto/edit-section-attribute.dto";
import { CreateSectionAttributeValueGroup } from "./dto/create-section-attribute-value.dto";
import { CreateAttributeRuleDto } from "./dto/create-attribute-rule.dto";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { multerConfig } from "../../config/multer.config";

interface SectionQuery {
  moduleId: string;
  submoduleId: string;
}

@Controller("extended")
export class AttributeValuesController {
  constructor(private attributeValuesService: AttributeValuesService) {}

  @Post("section")
  async createSection(
    @Body() section: CreateSectionDto & CreateSectionAttributeDto,
  ) {
    return this.attributeValuesService.createSectionOrGlobalAttribute(section);
  }

  @Post("section/attribute")
  async createSectionAttribute(
    @Body() sectionAttribute: CreateSectionAttributeDto,
  ) {
    return this.attributeValuesService.createSectionAttribute(sectionAttribute);
  }

  @Post("bulk")
  async upsertBulkSectionAttributes(
    @Body() sectionAttributes: CreateSectionAttributeDto[],
    @Query("sectionId") sectionId: string,
  ) {
    return this.attributeValuesService.upsertBulkSectionAttributes(
      sectionAttributes,
      Number(sectionId),
    );
  }

  @Post("bulk/options")
  async upsertBulkSectionAttributesOption(
    @Body() sectionAttributes: CreateSectionAttributeOptionDto[],
    @Query("attributeId") attributeId: string,
  ) {
    return this.attributeValuesService.upsertBulkSectionAttributesOption(
      sectionAttributes,
      Number(attributeId),
    );
  }

  @Post("plain/bulk/options")
  async upsertGlobalAttributesOption(
    @Body() sectionAttributes: CreateSectionAttributeOptionDto[],
    @Query("attributeId") attributeId: string,
  ) {
    return this.attributeValuesService.upsertGlobalAttributesOption(
      sectionAttributes,
      Number(attributeId),
    );
  }

  @Post("plain/bulk")
  async upsertBulkGlobalAttributes(
    @Body() globalAttributes: CreateSectionAttributeDto[],
  ) {
    return this.attributeValuesService.upsertBulkGlobalAttributes(
      globalAttributes,
    );
  }

  @Post("attribute/values")
  @UseInterceptors(AnyFilesInterceptor(multerConfig))
  async createSectionAttributeValue(
    @Body() sectionAttributeValues: CreateSectionAttributeValueGroup,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
  ) {
    const user = req.user;

    return this.attributeValuesService.createSectionAttributeValue(
      sectionAttributeValues,
      files,
      Number(user.userId),
    );
  }

  @Post("attribute/global/values")
  @UseInterceptors(AnyFilesInterceptor(multerConfig))
  async createGlobalAttributeValue(
    @Body() sectionAttributeValues: CreateSectionAttributeValueGroup,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
  ) {
    const user = req.user;

    return this.attributeValuesService.createGlobalAttributeValue(
      sectionAttributeValues,
      files,
      Number(user.userId),
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
    return this.attributeValuesService.getSections(
      Number(query.moduleId),
      Number(query.submoduleId),
    );
  }

  @Get("section/attributes")
  async getSectionBySlug(
    @Query("slug") slug: string,
    @Query("entityReference") entityReference: string,
    @Query("modelType") modelType: string,
    @Query("isGlobal") isGlobal: string,
  ) {
    return this.attributeValuesService.getSectionBySlug(
      slug,
      entityReference,
      modelType,
      isGlobal,
    );
  }

  @Get("options")
  async getAttributeOptions(@Query("attributeId") attributeId: string) {
    return this.attributeValuesService.getAttributeOptions(Number(attributeId));
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
