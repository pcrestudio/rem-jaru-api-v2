import { IsNumber, IsOptional, IsString } from "class-validator";

export class EditSupervisionDto {
  @IsNumber()
  authorityId: number;

  @IsNumber()
  situationId: number;

  @IsNumber()
  responsibleId: number;

  @IsString()
  @IsOptional()
  isProvisional: string;

  @IsNumber()
  projectId: number;

  @IsString()
  @IsOptional()
  guaranteeLetter?: string;

  @IsNumber()
  id: number;
}
