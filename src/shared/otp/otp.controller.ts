import { Controller, Post, Body, Res } from "@nestjs/common";
import { OtpService } from "./otp.service";
import { Public } from "../auth/decorators/public.decorator";
import { ConfigService } from "@nestjs/config";

@Controller("otp")
export class OtpController {
  protected cookiesConfig = {};
  constructor(
    private readonly configService: ConfigService,
    private readonly otpService: OtpService
  ) {
    this.cookiesConfig = {
      httpOnly: true,
      secure:
        this.configService.get("NODE_ENV") === "production" ? true : false,
      sameSite:
        this.configService.get("NODE_ENV") === "production" ? "none" : "lax",
      maxAge: 3600000,
      path: "/",
      domain:
        this.configService.get("NODE_ENV") === "production"
          ? ".estudiorodrigo.com"
          : "localhost",
    };
  }

  @Public()
  @Post("generate")
  async generateOtp(@Body("email") email: string) {
    return this.otpService.generateOtp(email);
  }

  @Public()
  @Post("validate")
  async validateOtp(@Body() body: any, @Res() res) {
    const { email, token } = body;
    const tokenResponse = await this.otpService.validateOtp(email, token);

    res.cookie("token", tokenResponse, this.cookiesConfig);
    return res.json(tokenResponse);
  }
}
