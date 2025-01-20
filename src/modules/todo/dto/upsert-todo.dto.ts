import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

export class UpsertTodoDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  entityReference: string;

  @IsBoolean()
  check: boolean;

  @IsString()
  entityStepReference: string;

  @IsNumber()
  responsibleId: number;

  @IsObject()
  dateExpiration: object;

  @IsNumber()
  @IsOptional()
  id?: number;
}
