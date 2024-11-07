import { IsNumber, IsString } from "class-validator";

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

  @IsNumber()
  cargoStudioId: number;

  @IsNumber()
  projectId: number;
}
