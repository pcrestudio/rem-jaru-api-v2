import { FilterCustomPaginationDto } from "../../custom_pagination/dto/fiter-custom-pagination.dto";

export interface FilterUsersDto extends FilterCustomPaginationDto {
  search?: string;
}
