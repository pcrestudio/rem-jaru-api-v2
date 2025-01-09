import { BadRequestException, Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/core/database/prisma.service";
import { EntityReferenceModel } from "../../common/utils/entity_reference_mapping";
import { CustomPaginationService } from "../../modules/custom_pagination/custom_pagination.service";
import { FilterUsersDto } from "../../modules/auth/dto/filter-users.dto";
import { UpsertRegisterDto } from "../../modules/auth/dto/user-register.dto";
import { hash } from "bcrypt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.prisma.user.findUnique({
      where: {
        email: email,
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
    let encrypt_password: string = "";

    if (payload.password) {
      encrypt_password = await hash(payload.password, 10);
    }

    const jaru_generated_password: string = await hash(
      this.config.get("JARU_PASSWORD"),
      10,
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

      const findRole = await this.prisma.userRole.findFirst({
        where: {
          userId: payload.id ? payload.id : 0,
          roleId: payload.roleId ? payload.roleId : 0,
        },
      });

      if (!findRole) {
        await this.prisma.userRole.create({
          data: {
            userId: userCreated.id,
            roleId: payload.roleId,
          },
        });

        return userCreated;
      }

      await this.prisma.userRole.update({
        data: {
          userId: userCreated.id,
          roleId: payload.roleId,
        },
        where: {
          userId_roleId: {
            userId: userCreated.id,
            roleId: findRole.roleId,
          },
        },
      });

      return userCreated;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async update(id: number, user: User) {
    return this.prisma.user.update({
      where: { id: id },
      data: user,
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
      },
    );
  }
}
