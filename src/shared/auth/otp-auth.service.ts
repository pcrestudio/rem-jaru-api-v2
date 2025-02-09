import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as speakeasy from "speakeasy";
import { JwtService } from "@nestjs/jwt";
import { MailService } from "../mail/mail.service";
import { UsersService } from "../users/users.service";
import { PrismaService } from "src/core/database/prisma.service";

import otpTemplate from "./templates/one-time-password.tpl";

@Injectable()
export class OtpAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService
  ) {}

  private readonly otpExpiryTime = 5 * 60; // 5 minutes
  private readonly maxFailedAttempts = 5;

  async generateOtp(email: string) {
    try {
      const user = await this.usersService.findByEmail(email);

      if (!user) throw new Error("User not found");

      if (user.failedOtpAttempts >= this.maxFailedAttempts) {
        throw new UnauthorizedException(
          "Account locked due to too many failed OTP attempts"
        );
      }

      //if (!user.otpSecret)
      user.otpSecret = speakeasy.generateSecret({ length: 20 }).base32;

      const token = speakeasy.totp({
        secret: user.otpSecret,
        encoding: "base32",
        step: this.otpExpiryTime,
      });

      await this.usersService.updateOtpSecret(user.id, user.otpSecret);

      const templateData = {
        displayName: user.firstName,
        otpCode: token,
      };

      await this.mailService.sendWithTemplate(
        otpTemplate,
        templateData,
        [email],
        "Código de Verificación"
      );

      return { message: "Código de verificación enviado" };
    } catch (error) {
      console.error(error);
    }
  }

  async validateOtp(email: string, token: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.otpSecret) {
      throw new UnauthorizedException("Código de verificación inválido");
    }

    if (user.failedOtpAttempts >= this.maxFailedAttempts) {
      throw new UnauthorizedException(
        "Account locked due to too many failed OTP attempts"
      );
    }

    const isValid = speakeasy.totp.verify({
      secret: user.otpSecret,
      encoding: "base32",
      token,
      step: this.otpExpiryTime,
      window: 1,
    });

    if (isValid) {
      user.failedOtpAttempts = 0;
      await this.usersService.updateUser(user.id, { failedOtpAttempts: 0 });

      const valid_user = await this.prisma.user.findFirst({
        where: { email: user.email },
        include: {
          UserRole: {
            include: {
              role: {
                select: {
                  name: true,
                  title: true,
                  description: true,
                },
              },
            },
          },
        },
      });

      const user_payload = {
        email: valid_user.email,
        firstName: valid_user.firstName,
        lastName: valid_user.lastName,
        role:
          valid_user.UserRole.length > 0
            ? valid_user.UserRole[0].role.name
            : "",
      };

      const payload = {
        sub: valid_user.id,
        user: user_payload,
      };

      await this.usersService.updateUser(user.id, {
        lastLogon: new Date(),
        failedOtpAttempts: 0,
      });

      return {
        access_token: this.jwtService.sign(payload),
        user: user_payload,
      };
    } else {
      if (user) {
        user.failedOtpAttempts += 1;

        if (user.failedOtpAttempts >= this.maxFailedAttempts) {
          user.isLocked = true;
          user.lockedAt = new Date();
        }

        await this.usersService.updateUser(user.id, {
          failedOtpAttempts: user.failedOtpAttempts,
          isLocked: user.isLocked,
          lockedAt: user.lockedAt,
        });
      }

      throw new UnauthorizedException("Invalid OTP");
    }
  }

  public async enableMfa(email) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const secret = speakeasy.generateSecret({ length: 20 });
    await this.usersService.updateUser(user.id, { otpSecret: secret.base32 });

    return {
      message: "MFA enabled",
      qrCode: speakeasy.otpauthURL({
        secret: secret.ascii,
        label: `${email} (Jaru Software)`,
        issuer: "Jaru Software",
      }),
    };
  }
}
