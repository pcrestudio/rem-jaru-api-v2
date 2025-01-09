import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { OIDCStrategy } from "passport-azure-ad";
import { AuthService } from "../auth.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AzureAdStrategy extends PassportStrategy(
  OIDCStrategy,
  "azure-ad",
) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      identityMetadata: `https://login.microsoftonline.com/${configService.get<string>("M365_TENANT_ID")}/v2.0/.well-known/openid-configuration`,
      clientID: configService.get<string>("M365_AUTH_CLIENT_ID"),
      clientSecret: configService.get<string>("M365_AUTH_CLIENT_SECRET"),
      responseType: "code id_token",
      responseMode: "form_post",
      redirectUrl: `${configService.get<string>("BACKEND_URL")}/auth/azure-ad/redirect`,
      allowHttpForRedirectUrl: true,
      passReqToCallback: true,
      scope: ["profile", "email", "openid"],
    });
  }

  async validate(
    req: any,
    profile: any,
    done: (err: any, user: any, info?: any) => void,
  ) {
    try {
      const user = await this.authService.validateAzureAdUser(profile);
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  }
}
