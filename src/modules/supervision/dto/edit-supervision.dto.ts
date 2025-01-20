import { IsNumber, IsOptional, IsString } from "class-validator";

export class EditSupervisionDto {
  @IsString()
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
  guaranteeLetter?: string;

  @IsNumber()
  id: number;
}
