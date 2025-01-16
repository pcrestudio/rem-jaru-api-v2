export const mappingSubmodules: Record<string, string> = {
  judicial_process_administrative: "procesos-judiciales-administrativos",
  judicial_process_labor_court: "procesos-judiciales-laborales",
  judicial_process_civil_court: "procesos-judiciales-civiles",
  judicial_process_criminal: "procesos-judiciales-penales",
  supervision_oefa: "supervisiones-oefa",
  supervision_osinergmin: "supervisiones-osinergmin",
  supervision_sunafil: "supervisiones-sunafil",
  supervision_ana: "supervisiones-ana",
};

export const mappingRevertSubmodules: Record<string, string> = {
  "procesos-judiciales-administrativos": "judicial_process_administrative",
  "procesos-judiciales-laborales": "judicial_process_labor_court",
  "procesos-judiciales-civiles": "judicial_process_civil_court",
  "procesos-judiciales-penales": "judicial_process_criminal",
  "supervisiones-oefa": "supervision_oefa",
  "supervisiones-osinergmin": "supervision_osinergmin",
  "supervisiones-sunafil": "supervision_sunafil",
  "supervisiones-ana": "supervision_ana",
};
