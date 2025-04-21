import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}

  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const frontendUrl =
      this.configService.get<string>("FRONTEND_URL") || "http://localhost:3000";

    console.log(`Petición sin autorización ${req.url}`);

    // If the request accepts HTML, redirect to the login page.
    if (
      req.headers.accept &&
      req.headers.accept.includes("text/html") &&
      req.url === "/auth/azure-ad/redirect"
    ) {
      return res.redirect(`${frontendUrl}/auth`);
    }

    // Otherwise, send a json response.
    res.status(401).json({
      statusCode: 401,
      message: "Unauthorized",
    });
  }
}
