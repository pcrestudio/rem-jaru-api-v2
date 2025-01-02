import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { AzureAdStrategy } from "./strategies/azure-ad.strategy";
import { AuthService } from "./auth.service";
import { SocketConfigService } from "./socketConfig.service";
import { HttpModule } from "@nestjs/axios";
import { ApiKeyStrategy } from "./strategies/apikey.strategy";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { UsersModule } from "../users/users.module";
import { LocalStrategy } from "./strategies/local.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { MailService } from "../mail/mail.service";

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ session: true }),
    JwtModule.register({
      secret: "your_jwt_secret",
      signOptions: { expiresIn: "60m" },
    }),
    HttpModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    AzureAdStrategy,
    ApiKeyStrategy,
    SocketConfigService,
    MailService,
  ],
  exports: [SocketConfigService, AuthService, PassportModule],
  controllers: [AuthController],
})
export class AuthModule {}
