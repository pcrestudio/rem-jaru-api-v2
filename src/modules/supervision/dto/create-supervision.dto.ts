import { IsNumber } from "class-validator";

export class CreateSupervisionDto {
  @IsNumber()
  authorityId: number;

  @IsNumber()
  situationId: number;

  @IsNumber()
  responsibleId: number;

  @IsNumber()
  projectId: number;
}
