import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserRegisterDto } from "./dto/user-register.dto";
import { UserAuthDto } from "./dto/user-auth.dto";
import { FilterUsersDto } from "./dto/filter-users.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("token")
  async auth(@Body() user: UserAuthDto): Promise<any> {
    return this.authService.auth(user);
  }

  @Post("register")
  async register(@Body() user: UserRegisterDto): Promise<any> {
    return this.authService.register(user);
  }

  @Get("users")
  async getUsers(@Query() filter: FilterUsersDto): Promise<any> {
    return this.authService.getUsers(filter);
  }
}
