import { FilterCustomPaginationDto } from "../../custom_pagination/dto/fiter-custom-pagination.dto";

export interface FilterReclaimDto extends FilterCustomPaginationDto {
  entityReference: string;
  modelType: string;
}
