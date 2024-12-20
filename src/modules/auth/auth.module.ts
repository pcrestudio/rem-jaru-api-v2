import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { CustomPaginationModule } from "../custom_pagination/custom_pagination.module";

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [CustomPaginationModule],
})
export class AuthModule {}
