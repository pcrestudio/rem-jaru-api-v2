import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class AzureAdAuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private jwksCache;

  async getAzureADPublicKeys(kid?: string): Promise<any> {
    // Use cached keys if available
    if (!this.jwksCache) {
      const metadataUrl = `https://login.microsoftonline.com/${this.config.get("TENANT_ID")}/v2.0/.well-known/openid-configuration`;

      const metadataResponse = await firstValueFrom(
        this.httpService.get(metadataUrl),
      );
      const jwksUri = metadataResponse.data.jwks_uri;

      const jwksResponse = await firstValueFrom(this.httpService.get(jwksUri));
      this.jwksCache = jwksResponse.data.keys;
    }

    if (!this.jwksCache || !this.jwksCache.length) {
      throw new Error("The JWKS endpoint did not contain any keys");
    }

    // If 'kid' is provided, find the corresponding key
    if (kid) {
      const signingKey = this.jwksCache.find((key) => key.kid === kid);
      if (!signingKey) {
        throw new Error(
          `The JWKS endpoint did not contain a key with kid ${kid}`,
        );
      }
      return signingKey;
    }

    // If no 'kid' is provided, return all keys
    return this.jwksCache;
  }
}
