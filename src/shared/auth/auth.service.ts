import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../core/database/prisma.service";
import { GetUserDto } from "../../modules/auth/dto/get-user.dto";
import { AzureAdAuthService } from "./azure-ad-auth.service";
import { OtpAuthService } from "./otp-auth.service";
import { PasswordAuthService } from "./password-auth.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordAuthService: PasswordAuthService,
    private readonly azureAdAuthService: AzureAdAuthService,
    private readonly otpAuthService: OtpAuthService,
    private readonly prisma: PrismaService,
  ) {}

  validateKey(apiKey: string) {
    return this.config.get("APP_API_KEY") === apiKey;
  }

  async requestPasswordReset(email: string, authMethod?: string) {
    return this.passwordAuthService.requestPasswordReset(email, authMethod);
  }

  async resetPassword(token: string, password: string) {
    return this.passwordAuthService.resetPassword(token, password);
  }

  async validatePasswordUser(email: string, pass: string) {
    return this.passwordAuthService.validateUser(email, pass);
  }

  async generateOtp(email: string) {
    return this.otpAuthService.generateOtp(email);
  }

  async validateOtp(email: string, otp: string) {
    return this.otpAuthService.validateOtp(email, otp);
  }

  async enableMfa(email: string) {
    return this.otpAuthService.enableMfa(email);
  }

  async getAzureADPublicKeys(kid?: string): Promise<any> {
    return this.azureAdAuthService.getAzureADPublicKeys(kid);
  }

  async login(user: any) {
    const valid_user = await this.prisma.user.findFirst({
      where: { email: user.email, isActive: true, isLocked: false },
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

    if (valid_user) {
      return this._generateUserToken(valid_user);
    }

    throw new BadRequestException("El usuario no existe");
  }

  // Validate or create user from Azure AD profile
  async validateAzureAdUser(profile: any): Promise<any> {
    const email = profile._json.preferred_username;
    let user: GetUserDto = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.creteAzureADUser({
        email: email,

        displayName: profile.displayName,

        lastLogon: new Date(),

        isActive: true,
      });
    } else {
      await this.usersService.updateUser(user.id, {
        lastLogon: new Date(),
      });
    }

    await this.usersService.updateUser(user.id, {
      lastLogon: new Date(),
    });

    return user;
  }

  private _generateUserToken(user: GetUserDto) {
    const user_payload = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      role: user.UserRole.length > 0 ? user.UserRole[0].role.name : "",
    };

    const payload = {
      sub: user.id,
      user: user_payload,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: user_payload,
    };
  }
}
