import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AzureAdAuthGuard } from "./guards";
import { ConfigService } from "@nestjs/config";
import { Public } from "./decorators/public.decorator";

@Controller("auth")
export class AuthController {
  protected cookiesConfig = {};

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
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

  // Local authentication endpoint
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req, @Res() res) {
    const user = req.user;
    const token = await this.authService.login(user);

    res.cookie("token", token, this.cookiesConfig);

    req.session.redirect = null;
    return res.json(token);
  }

  @Post("logout")
  @HttpCode(200)
  logout(@Res() res) {
    // Clear the HttpOnly cookie
    res.clearCookie("token", this.cookiesConfig);
    return res.json({ message: "Logged out successfully" });
  }

  // Protected route example
  @Public()
  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Request() req) {
    return req.user;
  }

  // Initiate Azure AD authentication
  @Public()
  @Get("azure-ad")
  @UseGuards(AzureAdAuthGuard)
  async azureAdAuth(@Req() req) {
    // Store the redirect param in the session (if you're using session)
    req.session.redirect = req.query.redirect || "/admin";

    // AzureAdAuthGuard Initiates Azure AD OAuth flow
  }

  // Azure AD redirect/callback endpoint
  @Public()
  @Post("azure-ad/redirect")
  @UseGuards(AzureAdAuthGuard)
  async azureAdRedirect(@Req() req, @Res() res) {
    const user = req.user;
    const token = await this.authService.login(user);

    res.cookie("token", token, this.cookiesConfig);

    const redirect = req.session.redirect || "/admin";
    req.session.redirect = null; // Clear the session key

    // Redirect with the token *and* the original redirect path
    return res.redirect(
      `${this.configService.get("FRONTEND_URL")}/auth/azure-ad/callback?token=${token.access_token}&redirect=${redirect}`
    );
  }

  @Public()
  @Post("forgot-password")
  async forgotPassword(@Body("email") email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Public()
  @Post("reset-password")
  async resetPassword(
    @Body("token") token: string,
    @Body("password") password: string
  ) {
    return this.authService.resetPassword(token, password);
  }
}
