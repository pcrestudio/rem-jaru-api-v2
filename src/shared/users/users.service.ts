import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { CreateUserDto } from "./dto/create-user.dto";
import { PrismaService } from "src/core/database/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    return user;
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
    //const hashedPassword = await bcrypt.hash(userDto.password, 10);

    const createdUser = await this.prisma.user.create({
      data: { ...rest, password: hashedPassword },
    });
    return createdUser;
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async update(id: number, user: User) {
    console.log(user);

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
}
