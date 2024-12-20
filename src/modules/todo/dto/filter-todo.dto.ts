import { FilterCustomPaginationDto } from "../../custom_pagination/dto/fiter-custom-pagination.dto";

export interface FilterTodoDto extends FilterCustomPaginationDto {
  entityReference: string;
}
