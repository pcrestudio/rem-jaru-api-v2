import { IsNumber, IsString } from "class-validator";

export class UpsertIncidentDto {
  @IsString()
  name: string;

  @IsNumber()
  instanceId: number;
}
