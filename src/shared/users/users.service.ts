import { BadRequestException, Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/core/database/prisma.service";
import { EntityReferenceModel } from "../../common/utils/entity_reference_mapping";
import { CustomPaginationService } from "../../modules/custom_pagination/custom_pagination.service";
import { FilterUsersDto } from "../../modules/auth/dto/filter-users.dto";
import { UpsertRegisterDto } from "../../modules/auth/dto/user-register.dto";
import { hash } from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { MailService } from "../mail/mail.service";
import createUserTemplate from "./templates/create-user.tpl";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: MailService
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

  async create(payload: UpsertRegisterDto) {
    let encrypt_password = "";

    if (payload.password) {
      encrypt_password = await hash(payload.password, 10);
    }

    const jaru_generated_password = await hash(
      this.config.get("JARU_PASSWORD"),
      10
    );

    try {
      const userCreated = await this.prisma.user.upsert({
        create: {
          email: payload.email,
          password: payload.password
            ? encrypt_password
            : jaru_generated_password,
          firstName: payload.firstName,
          lastName: payload.lastName,
          authMethod: payload.authMethod,
          displayName: payload.displayName,
        },
        update: {
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          authMethod: payload.authMethod,
          displayName: payload.displayName,
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

      const templateData = {
        displayName: userCreated.displayName,
        password: this.config.get("JARU_PASSWORD"),
      };

      await this.mail.sendWithTemplate(
        createUserTemplate,
        templateData,
        [userCreated.email],
        "Nuevo usuario - Jaru Software."
      );

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
    return CustomPaginationService._getPaginationModel(
      this.prisma,
      EntityReferenceModel.User,
      {
        page: filter.page,
        pageSize: filter.pageSize,
        includeConditions: {
          UserRole: {
            include: {
              role: true,
            },
          },
        },
      }
    );
  }
}
