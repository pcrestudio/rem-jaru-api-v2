import { Controller, Get, Query } from "@nestjs/common";
import { ReportService } from "./report.service";
import { FilterReportDto } from "./dto/filter-report.dto";

@Controller("report")
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Get("init")
  async getInitReportByFilter(@Query() filter: FilterReportDto) {
    return this.reportService.getInitReportByFilter(filter);
  }

  @Get("byTodos")
  async getReportByTodos(@Query() filter: FilterReportDto) {
    return this.reportService.getReportByTodos(filter);
  }

  @Get("generic")
  async getGenericReportByTabSlug(@Query() filter: FilterReportDto) {
    return this.reportService.getGenericReportByTabSlug(filter);
  }

  @Get("byResponsible")
  async getReportByResponsible(@Query() filter: FilterReportDto) {
    return this.reportService.getReportByResponsible(filter);
  }

  @Get("byPerson")
  async getReportByDemandedOrPlaintiff(@Query() filter: FilterReportDto) {
    return this.reportService.getReportByDemandedOrPlaintiff(filter);
  }

  @Get("byStudio")
  async getReportByStudio(@Query() filter: FilterReportDto) {
    return this.reportService.getReportByStudio(filter);
  }
}
