import { GetSectionAttributeOptionDto } from "./get-section-attribute-option.dto";

export interface GetSectionAttributesDto {
  sectionId: number;
  label: string;
  slug: string;
  isActive: boolean;
  order: number;
  rowLayout: RowLayout;
  submoduleId: number;
  dataType: DataType;
  moduleId: number;
  sectionAttributeId: number;
  globalAttributeId?: number;
  isForReport?: boolean;
  conditionalRender?: boolean;
  options?: GetSectionAttributeOptionDto[];
}

export enum DataType {
  TEXT = "TEXT",
  TEXTAREA = "TEXTAREA",
  INTEGER = "INTEGER",
  FLOAT = "FLOAT",
  DATE = "DATE",
  LIST = "LIST",
  FILE = "FILE",
  EMAIL = "EMAIL",
  BOOLEAN = "BOOLEAN",
}

export enum RowLayout {
  single = "single",
  twoColumns = "twoColumns",
  threeColumns = "threeColumns",
}
