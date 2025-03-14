import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/core/database/prisma.service";
import { EntityReferenceModel } from "../../common/utils/entity_reference_mapping";
import { CustomPaginationService } from "../../modules/custom_pagination/custom_pagination.service";
import { FilterUsersDto } from "../../modules/auth/dto/filter-users.dto";
import { UpsertRegisterDto } from "../../modules/auth/dto/user-register.dto";
import { ConfigService } from "@nestjs/config";
import { MailService } from "../mail/mail.service";
import { AuthService } from "../auth/auth.service";
import { AuthMethod } from "../../config/auth-method.config";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.prisma.user.findUnique({
      where: {
        email: email,
        isActive: true,
      },
    });
  }

  async findByResetToken(resetToken: string): Promise<User | undefined> {
    return this.prisma.user.findUnique({
      where: {
        resetPasswordToken: resetToken,
      },
    });
  }

  async creteAzureADUser(payload: any) {
    try {
      const userCreated = await this.prisma.user.create({
        data: {
          email: payload.email,
          //firstName: payload.given_name,
          //lastName: payload.family_name,
          authMethod: "azure-ad",
          displayName: payload.displayName,
        },
      });

      await this.prisma.userRole.create({
        data: { userId: userCreated.id, roleId: 1 }, // Default role: 2 - admin (Administrator)
      });

      return userCreated;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async create(payload: UpsertRegisterDto) {
    try {
      const userCreated = await this.prisma.user.upsert({
        create: {
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          authMethod: payload.authMethod,
          displayName: payload.displayName,
          studioId: payload.studioId ?? null,
        },
        update: {
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          authMethod: payload.authMethod,
          displayName: payload.displayName,
          studioId: payload.studioId ?? null,
        },
        where: {
          id: payload.id ? Number(payload.id) : 0,
        },
      });

      const findRole = await this.prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId: userCreated.id,
            roleId: payload.roleId,
          },
        },
      });

      if (findRole) {
        await this.prisma.userRole.update({
          data: {
            roleId: payload.roleId,
          },
          where: {
            userId_roleId: {
              userId: userCreated.id,
              roleId: payload.roleId,
            },
          },
        });
      } else {
        await this.prisma.userRole.deleteMany({
          where: {
            userId: userCreated.id,
          },
        });

        await this.prisma.userRole.create({
          data: {
            userId: userCreated.id,
            roleId: payload.roleId,
          },
        });
      }

      if (userCreated.authMethod !== AuthMethod.local && payload.id)
        return userCreated;

      if (!payload.id && userCreated.authMethod === AuthMethod.local) {
        await this.authService.requestPasswordReset(
          userCreated.email,
          userCreated.authMethod,
        );
      }

      return userCreated;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async updateUser(id: number, data) {
    return this.prisma.user.update({
      where: { id: id },
      data,
    });
  }

  async updateOtpSecret(id: number, otpSecret: string) {
    // Set expiry time (e.g., 1 hour from now)
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    return this.prisma.user.update({
      where: { id: id },
      data: { otpSecret: otpSecret, otpExpires: expires },
    });
  }

  async getUsers(filter: FilterUsersDto) {
    let whereFields = {};

    if (filter.studioId) {
      whereFields = {
        studioId: Number(filter.studioId),
      };
    }

    return CustomPaginationService._getPaginationModel(
      this.prisma,
      EntityReferenceModel.User,
      {
        page: filter.page,
        pageSize: filter.pageSize,
        includeConditions: {
          studio: true,
          UserRole: {
            include: {
              role: true,
            },
          },
        },
        whereFields,
      },
    );
  }

  async toggleLockedUser(id: number) {
    return this.prisma.user.updateMany({
      where: {
        isLocked: true,
        id,
      },
      data: {
        isLocked: false,
        lockedAt: null,
        failedLoginAttempts: 0,
      },
    });
  }
}
