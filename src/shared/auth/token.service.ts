import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(user: any) {
    const payload = { username: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }
}
