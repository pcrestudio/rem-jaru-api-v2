import { FilterReportDto } from "../../report/dto/filter-report.dto";
import { FilterCustomPaginationDto } from "../../custom_pagination/dto/fiter-custom-pagination.dto";

export interface FilterJudicialProcessDto
  extends FilterReportDto,
    FilterCustomPaginationDto {
  slug: string;
  search: string;
}
