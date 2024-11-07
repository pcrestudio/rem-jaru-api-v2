import { IsNumber, IsString } from "class-validator";

export class EditJudicialProcessDto {
  @IsString()
  fileCode: string;

  @IsNumber()
  projectId: number;

  @IsNumber()
  cargoStudioId: number;

  @IsString()
  demanded: string;

  @IsString()
  plaintiff: string;

  @IsString()
  coDefendant: string;

  @IsNumber()
  id: number;
}
