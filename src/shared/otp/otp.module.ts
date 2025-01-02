import { Module } from "@nestjs/common";
import { OtpService } from "./otp.service";
import { OtpController } from "./otp.controller";
import { UsersModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { MailService } from "../mail/mail.service";

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: "your_jwt_secret", // Should match the secret in AuthModule
      signOptions: { expiresIn: "60m" },
    }),
  ],
  providers: [OtpService, MailService],
  controllers: [OtpController],
})
export class OtpModule {}
