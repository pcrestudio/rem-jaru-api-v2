export const entityReferenceMapping: Record<Entities, string> = {
  JPA: "JudicialProcess",
  SOEF: "Supervision",
  SONG: "Supervision",
  SNF: "Supervision",
  SANA: "Supervision",
  ISD: "StepData",
};

export enum Entities {
  JPA = "JPA",
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
