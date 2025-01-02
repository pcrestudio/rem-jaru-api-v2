import { IsString, IsNumber, IsOptional } from "class-validator";

export class EnvironmentConfig {
  @IsString()
  @IsOptional()
  readonly NODE_ENV: string = "development"; // default value

  @IsNumber()
  readonly PORT: number;

  @IsString()
  readonly FRONTEND_URL: string;

  @IsString()
  readonly BACKEND_URL: string;

  @IsString()
  readonly DATABASE_URL: string;

  @IsString()
  readonly ELASTICSEARCH_NODE: string;

  @IsNumber()
  readonly ELASTICSEARCH_MAX_RETRIES: number;

  @IsNumber()
  readonly ELASTICSEARCH_REQ_TIMEOUT: number;

  @IsString()
  readonly ELASTICSEARCH_INDEX: string;

  @IsString()
  readonly JWT_EXPIRES_IN: string;

  @IsString()
  readonly JWT_SECRET: string;

  @IsString()
  readonly M365_TENANT_ID: string;

  @IsString()
  readonly M365_AUTH_CLIENT_ID: string;

  @IsString()
  readonly M365_AUTH_CLIENT_SECRET: string;
}
