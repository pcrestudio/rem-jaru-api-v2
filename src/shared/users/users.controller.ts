// src/users/users.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Param,
  Query,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Public } from "../auth/decorators/public.decorator";
import { FilterUsersDto } from "../../modules/auth/dto/filter-users.dto";
import { UpsertRegisterDto } from "../../modules/auth/dto/user-register.dto";

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
  async create(@Body() createUserDto: UpsertRegisterDto) {
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

  @Get("")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUsers(@Query() filter: FilterUsersDto): Promise<any> {
    return this.usersService.getUsers(filter);
  }

  @Get("toggle/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async toggleLockedUser(@Param("id") id: string) {
    return this.usersService.toggleLockedUser(Number(id));
  }
}
