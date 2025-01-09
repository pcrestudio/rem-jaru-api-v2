import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import * as speakeasy from "speakeasy";
import { JwtService } from "@nestjs/jwt";
import { MailService } from "../mail/mail.service";
import otpTemplate from "./templates/one-time-password.tpl";
import { PrismaService } from "../../core/database/prisma.service";

@Injectable()
export class OtpService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  // Generate and send OTP
  async generateOtp(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new Error("User not found");

    if (!user.otpSecret)
      user.otpSecret = speakeasy.generateSecret({ length: 20 }).base32;

    const token = speakeasy.totp({
      secret: user.otpSecret,
      encoding: "base32",
    });

    await this.usersService.updateOtpSecret(user.id, user.otpSecret);

    // TODO: Send OTP via email or SMS
    console.log(`OTP for ${email}: ${token}`);
    const templateData = {
      displayName: user.firstName,
      otpCode: token,
    };

    await this.mailService.sendWithTemplate(
      otpTemplate,
      templateData,
      [email],
      "Código de Verificación",
    );
    // await this.mailService.sendEmail(
    //   [email],
    //   "Código de Verificación",
    //   token,
    //   false
    // );

    return { message: "Código de verificación enviado" };
  }

  // Validate OTP and issue JWT
  async validateOtp(email: string, token: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.otpSecret || user.otpExpires < new Date()) {
      throw new Error("Código de verificación inválido");
    }

    const isValid = speakeasy.totp.verify({
      secret: user.otpSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (isValid) {
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

      return {
        access_token: this.jwtService.sign(payload),
        user: user_payload,
      };
    } else {
      throw new Error("Invalid OTP");
    }
  }
}
