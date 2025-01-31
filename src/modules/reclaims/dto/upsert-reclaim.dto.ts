import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpsertReclaimDto {
  @IsNumber()
  amount: number;

  @IsNumber()
  contingencyPercentage: number;

  @IsString()
  contingencyLevel: string;

  @IsNumber()
  provisionContingency: number;

  @IsNumber()
  provisionAmount: number;

  @IsNumber()
  @IsOptional()
  reclaimId?: number;
}
