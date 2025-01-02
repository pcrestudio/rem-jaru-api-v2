import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WsException } from '@nestjs/websockets';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const contextType = host.getType();

    switch (contextType) {
      case 'http':
        this.handleHttpException(exception, host);
        break;
      case 'ws':
        this.handleWsException(exception, host);
        break;
      case 'rpc':
        this.handleRpcException(exception, host);
        break;
      default:
        this.handleUnknownException(exception);
        break;
    }
  }

  private handleHttpException(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    console.log('====================================');
    console.log(exception);
    console.log('====================================');

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }

  private handleWsException(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();

    const message =
      exception instanceof WsException
        ? exception.getError()
        : 'Internal server error';

    client.emit('exception', {
      status: 'error',
      message: message,
    });
  }

  private handleRpcException(exception: unknown, host: ArgumentsHost) {
    this.logger.error('RPC exception', exception);
  }

  private handleUnknownException(exception: unknown) {
    this.logger.error('Unhandled exception', exception);
  }
}

/*


import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
*/
