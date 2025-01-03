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
}
