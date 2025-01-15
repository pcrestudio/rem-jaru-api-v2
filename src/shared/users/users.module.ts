import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { MailService } from "../mail/mail.service";

@Module({
  providers: [UsersService, MailService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
