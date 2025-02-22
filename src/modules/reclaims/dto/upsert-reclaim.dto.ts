import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpsertReclaimDto {
  @IsNumber()
  amount: number;

  @IsNumber()
  contingencyPercentage: number;

  @IsString()
  contingencyLevel: string;

  @IsString()
  concept: string;

  @IsNumber()
  provisionContingency: number;

  @IsNumber()
  provisionAmount: number;

  @IsNumber()
  @IsOptional()
  remoteAmount?: number;

  @IsNumber()
  @IsOptional()
  posibleAmount?: number;

  @IsNumber()
  @IsOptional()
  reclaimId?: number;
}
