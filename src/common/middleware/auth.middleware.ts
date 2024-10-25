import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { IncomingHttpHeaders } from "http";
import { verify } from "jsonwebtoken";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const headers: IncomingHttpHeaders = req.headers;
    const authorization: string = headers["authorization"];

    if (!authorization) {
      throw new UnauthorizedException();
    }

    const token: string = authorization.split(" ")[1];

    verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        console.log(error);
        throw new ForbiddenException();
      }

      req.sub = Number(decoded.sub);

      next();
    });
  }
}
