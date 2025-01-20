import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response, Request } from "express";

@Catch()
export class HttpExceptionFilters implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilters.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const context_type = host.getType();

    switch (context_type) {
      case "http":
        this.handleHttpException(exception, host);
        break;
      default:
        this.handleUnknowException(exception);
        break;
    }
  }

  private handleHttpException(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : "Internal Server Error";

    console.log("===============================");
    console.log(exception);
    console.log("===============================");

    // response.status(status).json({
    //   statusCode: status,
    //   timestamp: new Date().toISOString(),
    //   path: request.url,
    //   message: message,
    // });
    response.status(status).json(message);
  }

  private handleUnknowException(exception: unknown) {
    this.logger.error("Unhandled exception", exception);
  }
}
