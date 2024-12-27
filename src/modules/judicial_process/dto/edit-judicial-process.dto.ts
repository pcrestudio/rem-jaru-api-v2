import { IsNumber, IsOptional, IsString } from "class-validator";

export class EditJudicialProcessDto {
  @IsString()
  fileCode: string;

  @IsNumber()
  projectId: number;

  @IsNumber()
  cargoStudioId: number;

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
  coDefendant: string;

  @IsNumber()
  id: number;
}
