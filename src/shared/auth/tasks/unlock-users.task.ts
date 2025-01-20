import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../../../core/database/prisma.service";

@Injectable()
export class UnlockUsersTask {
  constructor(private readonly prisma: PrismaService) {}

  @Cron("*/1 * * * *") // Runs every minute
  async handleCron() {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    await this.prisma.user.updateMany({
      where: {
        isLocked: true,
        lockedAt: {
          lte: thirtyMinutesAgo,
        },
      },
      data: {
        isLocked: false,
        lockedAt: null,
        failedLoginAttempts: 0,
      },
    });
  }
}
