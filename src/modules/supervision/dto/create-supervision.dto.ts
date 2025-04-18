import { IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class CreateSupervisionDto {
  @IsString()
  @IsOptional()
  fileCode: string;

  @IsObject()
  @IsOptional()
  endDateConclusion?: object;

  @IsString()
  demanded: string;

  @IsString()
  comment: string;

  @IsString()
  controversialMatter: string;

  @IsString()
  plaintiff: string;

  @IsString()
  @IsOptional()
  coDefendant: string;

  @IsNumber()
  cargoStudioId: number;

  @IsNumber()
  @IsOptional()
  statusId: number;

  @IsNumber()
  authorityId: number;

  @IsNumber()
  situationId: number;

  @IsNumber()
  responsibleId: number;

  @IsNumber()
  @IsOptional()
  secondaryResponsibleId: number;

  @IsNumber()
  projectId: number;

  @IsNumber()
  amount: number;
}
