export const entityReferenceMapping: Record<Entities, string> = {
  JPA: "JudicialProcess",
  ISD: "StepData",
};

export enum Entities {
  JPA = "JPA",
  ISD = "ISD",
}

export const getModelByEntityReference = (entityReference: string) => {
  const match = entityReference.match(/^[^\d]+/);
  return match ? entityReferenceMapping[match[0]] : null;
};
