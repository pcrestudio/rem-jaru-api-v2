import { IsNumber, IsOptional, IsString } from "class-validator";

export class EditSupervisionDto {
  @IsString()
  @IsOptional()
  fileCode: string;

  @IsString()
  demanded: string;

  @IsString()
  comment: string;

  @IsString()
  controversialMatter: string;

  @IsNumber()
  projectId: number;

  @IsNumber()
  cargoStudioId: number;

  @IsNumber()
  amount: number;

  @IsString()
  plaintiff: string;

  @IsString()
  @IsOptional()
  coDefendant: string;

  @IsNumber()
  authorityId: number;

  @IsNumber()
  situationId: number;

  @IsNumber()
  responsibleId: number;

  @IsString()
  @IsOptional()
  isProvisional: string;

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
  guaranteeLetter: string;

  @IsNumber()
  id: number;

  @IsNumber()
  @IsOptional()
  paidAmount: number;

  @IsNumber()
  @IsOptional()
  savingAmount: number;
}
