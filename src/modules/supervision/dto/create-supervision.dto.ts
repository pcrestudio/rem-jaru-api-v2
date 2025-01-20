import { IsNumber, IsString } from "class-validator";

export class CreateSupervisionDto {
  @IsString()
  fileCode: string;

  @IsString()
  demanded: string;

  @IsString()
  comment: string;

  @IsString()
  controversialMatter: string;

  @IsString()
  plaintiff: string;

  @IsString()
  coDefendant: string;

  @IsNumber()
  cargoStudioId: number;

  @IsNumber()
  authorityId: number;

  @IsNumber()
  situationId: number;

  @IsNumber()
  responsibleId: number;

  @IsNumber()
  projectId: number;

  @IsNumber()
  amount: number;
}
