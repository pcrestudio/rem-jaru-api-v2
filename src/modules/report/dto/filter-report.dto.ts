export interface FilterReportDto {
  moduleId: string;
  submoduleId: number;
  projectId: number;
  responsibleId: number;
  cargoStudioId?: string;
  statusId?: number;
  tabSlug?: string;
}
