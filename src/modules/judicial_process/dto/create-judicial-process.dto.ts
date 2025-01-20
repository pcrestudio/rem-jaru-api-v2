import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateJudicialProcessDto {
  @IsString()
  fileCode: string;

  @IsString()
  demanded: string;

  @IsString()
  plaintiff: string;

  @IsString()
  coDefendant: string;

  @IsString()
  controversialMatter: string;

  @IsString()
  @IsOptional()
  amount: string;

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
