import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { CreateUserDto } from "./dto/create-user.dto";
import { PrismaService } from "src/core/database/prisma.service";
import { EntityReferenceModel } from "../../common/utils/entity_reference_mapping";
import { CustomPaginationService } from "../../modules/custom_pagination/custom_pagination.service";
import { FilterUsersDto } from "../../modules/auth/dto/filter-users.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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

  async create(userDto: CreateUserDto) {
    const { password, ...rest } = userDto;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    return this.prisma.user.create({
      data: { ...rest, password: hashedPassword },
    });
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
