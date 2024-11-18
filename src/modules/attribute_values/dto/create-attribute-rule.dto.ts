import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateAttributeRuleDto {
  @IsNumber()
  targetAttributeId: number;

  @IsNumber()
  triggerAttributeId: number;

  @IsString()
  targetValue: string;

  @IsString()
  @IsOptional()
  id?: string;
}
