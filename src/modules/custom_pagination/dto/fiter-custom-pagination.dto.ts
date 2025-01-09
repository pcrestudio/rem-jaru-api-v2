export interface FilterCustomPaginationDto {
  page: number;
  pageSize: number;
  searchableFields?: string[];
  whereFields?: object;
  includeConditions?: object;
  selectConditions?: object;
  orConditions?: any;
}
