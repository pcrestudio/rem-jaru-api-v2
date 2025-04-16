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
      identityMetadata: `https://login.microsoftonline.com/${configService.get<string>("M365_AUTH_TENANT_ID")}/v2.0/.well-known/openid-configuration`,
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
      const email = profile?._json?.preferred_username;
      console.log("[AzureAD] Email recibido:", email);

      const user = await this.authService.validateAzureAdUser(profile);

      if (!user) {
        console.warn("[AzureAD] Usuario no encontrado para:", email);
        return done(null, false);
      }

      done(null, user);
    } catch (err) {
      console.error("[AzureAD] Error en validate:", err);
      done(err, false);
    }
  }
}
