import { Injectable, BadRequestException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../core/database/prisma.service";

@Injectable()
export class PasswordService {
  constructor(private readonly prisma: PrismaService) {}

  private minPasswordLength = 12;
  private passwordComplexity = true;
  private passwordHistory = 5;
  private minimumPasswordAge = 1;
  private maximumPasswordAge = 90;

  private validatePasswordComplexity(password: string): void {
    const complexityRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (password.length < this.minPasswordLength) {
      throw new BadRequestException(
        `Password must be at least ${this.minPasswordLength} characters long`
      );
    }

    if (this.passwordComplexity) {
      if (!complexityRegex.test(password)) {
        throw new BadRequestException(
          "Password must include uppercase, lowercase, number, and special character"
        );
      }
    }
  }

  async hashPassword(password: string): Promise<string> {
    this.validatePasswordComplexity(password);
    return bcrypt.hash(password, 10);
  }

  async checkPasswordHistory(
    userId: number,
    newPassword: string
  ): Promise<void> {
    const previousPasswords = await this.prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: this.passwordHistory,
    });

    for (const record of previousPasswords) {
      const isMatch = await bcrypt.compare(newPassword, record.password);
      if (isMatch) {
        throw new BadRequestException(
          `New password cannot be the same as any of the last ${this.passwordHistory} passwords`
        );
      }
    }
  }

  async savePasswordHistory(userId: number, password: string): Promise<void> {
    await this.prisma.passwordHistory.create({
      data: {
        userId,
        password,
      },
    });
  }

  async checkPasswordMinAge(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const passwordAge =
      (new Date().getTime() - new Date(user.passwordChangedAt).getTime()) /
      (1000 * 60 * 60 * 24);

    if (passwordAge < this.minimumPasswordAge) {
      throw new BadRequestException(
        `Password must be at least ${this.minimumPasswordAge} day old before changing`
      );
    }
  }

  async checkPasswordMaxAge(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const passwordAge =
      (new Date().getTime() - new Date(user.passwordChangedAt).getTime()) /
      (1000 * 60 * 60 * 24);

    if (passwordAge > this.maximumPasswordAge) {
      throw new BadRequestException(
        `Password must be changed every ${this.maximumPasswordAge} days`
      );
    }
  }
}
