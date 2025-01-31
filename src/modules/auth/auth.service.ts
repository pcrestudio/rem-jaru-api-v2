import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { compare } from "bcrypt";
import { UserAuthDto } from "./dto/user-auth.dto";
import { GetUserDto } from "./dto/get-user.dto";
import { CustomPaginationService } from "../custom_pagination/custom_pagination.service";
import { FilterUsersDto } from "./dto/filter-users.dto";
import { EntityReferenceModel } from "../../common/utils/entity_reference_mapping";
import { ConfigService } from "@nestjs/config";
import { sign } from "jsonwebtoken";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

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

  async getUsers(filter: FilterUsersDto) {
    return CustomPaginationService._getPaginationModel(
      this.prisma,
      EntityReferenceModel.User,
      {
        page: filter.page,
        pageSize: filter.pageSize,
        includeConditions: {
          UserRole: {
            include: {
              role: true,
            },
          },
        },
      },
    );
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
      token: sign(payload, process.env.JWT_SECRET, {}),
      user: user_payload,
    };
  }
}
