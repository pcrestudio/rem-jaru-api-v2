import { FilterCustomPaginationDto } from "../../custom_pagination/dto/fiter-custom-pagination.dto";

export interface FilterTodoDto extends FilterCustomPaginationDto {
  entityReference: string;
  entityStepReference: string;
  check: string;
  alert: string;
  state: string;
  responsibleId: number;
  submoduleId: number;
  moduleId: number;
  cargoStudioId?: number;
}
