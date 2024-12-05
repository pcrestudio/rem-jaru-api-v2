import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { UserRegisterDto } from "./dto/user-register.dto";
import { compare, hash } from "bcrypt";
import { UserAuthDto } from "./dto/user-auth.dto";
import { GetUserDto } from "./dto/get-user.dto";
import { sign } from "jsonwebtoken";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async auth(user: UserAuthDto) {
    const valid_user = await this.prisma.user.findFirst({
      where: { email: user.email },
      include: {
        UserRole: {
          include: {
            role: {
              select: {
                name: true,
                title: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (valid_user) {
      const password_matches = await compare(
        user.password,
        valid_user.password,
      );

      if (password_matches) return this._generateUserToken(valid_user);

      throw new BadRequestException("Las contraseñas no coinciden");
    }

    throw new NotFoundException("Usuario no encontrado");
  }

  async register(user: UserRegisterDto): Promise<GetUserDto> {
    const encrypt_password: string = await hash(user.password, 10);

    try {
      return this.prisma.user.create({
        data: {
          email: user.email,
          password: encrypt_password,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getUsers() {
    return this.prisma.user.findMany({});
  }

  private _generateUserToken(user: GetUserDto) {
    const user_payload = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.UserRole.length > 0 ? user.UserRole[0].role.name : "",
    };

    const payload = {
      sub: user.id,
      user: user_payload,
    };

    return {
      token: sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }),
      user: user_payload,
    };
  }
}
