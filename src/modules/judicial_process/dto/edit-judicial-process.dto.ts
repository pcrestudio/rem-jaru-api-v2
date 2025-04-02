import { IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class EditJudicialProcessDto {
  @IsString()
  @IsOptional()
  fileCode: string;

  @IsNumber()
  projectId: number;

  @IsNumber()
  cargoStudioId: number;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  isProvisional: string;

  @IsString()
  @IsOptional()
  guaranteeLetter: string;

  @IsNumber()
  responsibleId: number;

  @IsNumber()
  @IsOptional()
  secondaryResponsibleId: number;

  @IsString()
  demanded: string;

  @IsString()
  controversialMatter: string;

  @IsString()
  plaintiff: string;

  @IsString()
  @IsOptional()
  coDefendant: string;

  @IsString()
  @IsOptional()
  contingencyLevel: string;

  @IsString()
  @IsOptional()
  contingencyPercentage: string;

  @IsNumber()
  @IsOptional()
  provisionContingency: number;

  @IsNumber()
  @IsOptional()
  provisionAmount: number;

  @IsString()
  @IsOptional()
  comment: string;

  @IsNumber()
  id: number;

  @IsNumber()
  @IsOptional()
  paidAmount: number;

  @IsString()
  @IsOptional()
  statusId: string;

  @IsObject()
  @IsOptional()
  endDateConclusion?: object;

  @IsNumber()
  @IsOptional()
  savingAmount: number;
}
