import { FilterCustomPaginationDto } from "../../custom_pagination/dto/fiter-custom-pagination.dto";

export interface FilterUsersDto extends FilterCustomPaginationDto {
  studioId?: number;
  isSpecialist?: string;
}
