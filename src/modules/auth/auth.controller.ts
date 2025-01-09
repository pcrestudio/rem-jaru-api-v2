import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserAuthDto } from "./dto/user-auth.dto";
import { FilterUsersDto } from "./dto/filter-users.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("token")
  async auth(@Body() user: UserAuthDto): Promise<any> {
    return this.authService.auth(user);
  }

  @Get("users")
  async getUsers(@Query() filter: FilterUsersDto): Promise<any> {
    return this.authService.getUsers(filter);
  }
}
