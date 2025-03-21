export enum EntityReferenceModel {
  JudicialProcess = "JudicialProcess",
  Supervision = "Supervision",
  StepData = "StepData",
  ToDo = "ToDo",
  User = "User",
  Roles = "UserRole",
  Role = "Role",
  CEJ_ACTUACIONES = "cEJ_ExpedientesActuaciones",
  Reclaim = "Reclaim",
  Incidence = "Incidence",
}

export const mappingModuleES: Record<string, string> = {
  JudicialProcess: "Procesos Judiciales",
  Supervision: "Supervisiones",
};

export const mappingModuleEN: Record<string, string> = {
  "Procesos Judiciales": "JudicialProcess",
  Supervisiones: "Supervision",
};

export enum ModelType {
  JudicialProcess = "JudicialProcess",
  Supervision = "Supervision",
}

export const entityReferenceMapping: Record<Entities, string> = {
  JPA: EntityReferenceModel.JudicialProcess,
  JPL: EntityReferenceModel.JudicialProcess,
  JPC: EntityReferenceModel.JudicialProcess,
  JPCR: EntityReferenceModel.JudicialProcess,
  SOEF: EntityReferenceModel.Supervision,
  SONG: EntityReferenceModel.Supervision,
  SNF: EntityReferenceModel.Supervision,
  SANA: EntityReferenceModel.Supervision,
  ISD: EntityReferenceModel.StepData,
};

export enum Entities {
  JPA = "JPA",
  JPL = "JPL",
  JPC = "JPC",
  JPCR = "JPCR",
  SOEF = "SOEF",
  SNF = "SNF",
  SONG = "SONG",
  SANA = "SANA",
  ISD = "ISD",
}

export const getModelByEntityReference = (entityReference: string) => {
  const match = entityReference.match(/^[^\d]+/);
  return match ? entityReferenceMapping[match[0]] : null;
};

export const getPrefixByEntityReference = (entityReference: string) => {
  const match = entityReference.match(/^[^\d]+/);
  return match ? match[0] : null;
};
