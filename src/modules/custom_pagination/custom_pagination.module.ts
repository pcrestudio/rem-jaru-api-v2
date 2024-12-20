import { Module } from "@nestjs/common";
import { CustomPaginationService } from "./custom_pagination.service";
import { PrismaModule } from "../../core/database/prisma.module";

@Module({
  providers: [CustomPaginationService],
  exports: [CustomPaginationService],
  imports: [PrismaModule],
})
export class CustomPaginationModule {}
