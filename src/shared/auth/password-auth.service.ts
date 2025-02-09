import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { PasswordService } from "./password.service";
import { UsersService } from "../users/users.service";
import { User } from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import { MailService } from "../mail/mail.service";
import passwordResetTemplate from "./templates/password-reset.tpl";

@Injectable()
export class PasswordAuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly userService: UsersService,
    private readonly passwordService: PasswordService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user?.isLocked) {
      throw new UnauthorizedException("Account is locked");
    }

    if (user && (await bcrypt.compare(pass, user.password))) {
      await this.passwordService.checkPasswordMaxAge(user.id);

      await this.userService.updateUser(user.id, {
        lastLogon: new Date(),
        failedLoginAttempts: 0,
      });

      const { ...result } = user;
      return result;
    } else {
      if (user) {
        await this.handleFailedLogin(user.email);
      }
      throw new UnauthorizedException("Invalid credentials");
    }
  }

  private async handleFailedLogin(userEmail: string): Promise<void> {
    const user = await this.userService.findByEmail(userEmail);
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= 5) {
      user.isLocked = true;
      user.lockedAt = new Date();
    }

    await this.userService.updateUser(user.id, {
      failedLoginAttempts: user.failedLoginAttempts,
      isLocked: user.isLocked,
      lockedAt: user.lockedAt,
    });
  }

  async resetPassword(token: string, password: string) {
    const user = await this.userService.findByResetToken(token);
    await this.passwordService.checkPasswordMinAge(user.id);
    await this.passwordService.checkPasswordHistory(user.id, password);
    const hashedPassword = await this.passwordService.hashPassword(password);

    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userService.updateUser(user.id, user);
    await this.passwordService.savePasswordHistory(user.id, hashedPassword);

    return { message: "Password has been reset successfully" };
  }

  async requestPasswordReset(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // For security, you might NOT throw an error here,
      // but respond with a success message anyway.
      //throw new NotFoundException("User not found");
      throw new UnauthorizedException("Password reset request denied");
    }

    // 1. Generate random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2. Set expiry time (e.g., 1 hour from now)
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    // 3. Store them on the user object
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expires;

    // 4. Save user
    await this.userService.updateUser(user.id, user);

    // 5. Send email with reset link
    await this.sendResetEmail(user, resetToken);

    return {
      message: "Mensaje enviado, por favor revisa tu correo electrónico",
      token: resetToken,
    };
  }

  private async sendResetEmail(user: User, token: string) {
    console.log(`Sending password reset email to ${user.email}`);

    const to = [user.email];
    const resetUrl = `${this.configService.get("FRONTEND_URL")}/auth/reset-password?token=${token}`;
    const subject = "Cambio de contraseña";
    const templateData = { displayName: user.firstName, resetUrl };

    await this.mailService.sendWithTemplate(
      passwordResetTemplate,
      templateData,
      to,
      subject,
    );
  }
}
