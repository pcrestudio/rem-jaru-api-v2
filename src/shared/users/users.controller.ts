// src/users/users.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Param,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Public } from "../auth/decorators/public.decorator";

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Public()
  @Get("find/:email")
  async checkAuthMetod(@Param("email") email: string) {
    const user = await this.usersService.findByEmail(email);

    // remove sensitive data
    delete user.isActive;
    delete user.password;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;
    delete user.lastLogon;
    delete user.otpExpires;
    delete user.otpSecret;

    return user;
  }

  @Public()
  @Post("register")
  async create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Get("admin")
  findAllUsers() {
    return this.usersService.findAll();
  }
}
