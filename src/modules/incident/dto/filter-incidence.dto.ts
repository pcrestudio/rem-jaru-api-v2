import { FilterCustomPaginationDto } from "../../custom_pagination/dto/fiter-custom-pagination.dto";

export interface FilterIncidenceDto extends FilterCustomPaginationDto {
  modelType: string;
  entityReference: string;
}
