import { HttpService } from "@nestjs/axios";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { JwtService } from "@nestjs/jwt";
import { MailService } from "../mail/mail.service";
import passwordResetTemplate from "./templates/password-reset.tpl";
import { User } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  validateKey(apiKey: string) {
    return this.config.get("APP_API_KEY") === apiKey;
  }

  private jwksCache; // Cache for JWKS

  async getAzureADPublicKeys(kid?: string): Promise<any> {
    // Use cached keys if available
    if (!this.jwksCache) {
      const metadataUrl = `https://login.microsoftonline.com/${this.config.get("TENANT_ID")}/v2.0/.well-known/openid-configuration`;

      const metadataResponse = await firstValueFrom(
        this.httpService.get(metadataUrl)
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
          `The JWKS endpoint did not contain a key with kid ${kid}`
        );
      }
      return signingKey;
    }

    // If no 'kid' is provided, return all keys
    return this.jwksCache;
  }

  // Validate user for local authentication
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user; // Exclude password from result
      return result;
    }
    return null;
  }

  // Generate JWT token
  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles || "user",
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Validate or create user from Azure AD profile
  async validateAzureAdUser(profile: any): Promise<any> {
    const email = profile._json.preferred_username;
    let user = await this.usersService.findByEmail(email);
    if (!user) {
      user = await this.usersService.create({
        email,
        displayName: profile.displayName,
        authMethod: "azure-ad",
        password: null, // No password for Azure AD users
        //roles: ["user"],
      });
    }
    return user;
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // For security, you might NOT throw an error here,
      // but respond with a success message anyway.
      throw new NotFoundException("User not found");
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
    await this.usersService.update(user.id, user);

    // 5. Send email with reset link
    await this.sendResetEmail(user, resetToken);

    return {
      message: "Mensaje enviado, por favor revisa tu correo electrónico",
    };
  }

  private async sendResetEmail(user: User, token: string) {
    console.log(`Sending password reset email to ${user.email}`);

    const to = [user.email];
    const resetUrl = `${this.config.get("FRONTEND_URL")}/auth/reset-password?token=${token}`;
    const subject = "Cambio de contraseña";
    const templateData = { displayName: user.firstName, resetUrl };

    await this.mailService.sendWithTemplate(
      passwordResetTemplate,
      templateData,
      to,
      subject
    );
  }

  async resetPassword(token: string, password: string) {
    // 1. Find user by token
    const user = await this.usersService.findByResetToken(token);
    if (!user || !user.resetPasswordToken) {
      throw new NotFoundException("Invalid or expired reset token");
    }

    // 2. Check expiry
    const now = new Date();
    if (now > user.resetPasswordExpires) {
      throw new NotFoundException("Reset token has expired");
    }

    // 3. Update user password
    // Make sure to hash the password with bcrypt, etc.
    user.password = await this.hashPassword(password);

    // 4. Clear token fields
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.usersService.update(user.id, user);

    return { message: "Password has been reset successfully" };
  }

  private async hashPassword(password: string) {
    const saltRounds = 10;
    const bcrypt = await import("bcrypt");
    return bcrypt.hash(password, saltRounds);
  }
}
