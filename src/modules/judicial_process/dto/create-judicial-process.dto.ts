import { IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class CreateJudicialProcessDto {
  @IsString()
  @IsOptional()
  fileCode: string;

  @IsObject()
  @IsOptional()
  endDateConclusion?: object;

  @IsString()
  demanded: string;

  @IsString()
  plaintiff: string;

  @IsString()
  @IsOptional()
  coDefendant: string;

  @IsString()
  controversialMatter: string;

  @IsString()
  @IsOptional()
  amount: string;

  @IsNumber()
  @IsOptional()
  statusId: string;

  @IsNumber()
  cargoStudioId: number;

  @IsNumber()
  responsibleId: number;

  @IsNumber()
  @IsOptional()
  secondaryResponsibleId: number;

  @IsNumber()
  projectId: number;
}
