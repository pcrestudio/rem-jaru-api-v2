import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserRegisterDto } from "./dto/user-register.dto";
import { UserAuthDto } from "./dto/user-auth.dto";

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
}
