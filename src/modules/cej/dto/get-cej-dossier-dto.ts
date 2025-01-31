export interface GetCejDossierDto {
  idExpediente: number;
  expedientePJ: string;
  cuadernos: number;
  actuaciones: number;
  created_at: Date;
  updated_at: Date;
  juzgado: string;
  partes: string;
  activo: string;
}
