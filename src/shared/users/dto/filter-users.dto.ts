import { FilterCustomPaginationDto } from "src/modules/custom_pagination/dto/fiter-custom-pagination.dto";

export interface FilterUsersDto extends FilterCustomPaginationDto {
  search?: string;
}
