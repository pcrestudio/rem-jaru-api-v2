import { GetUserRoleDto } from "../../roles/dto/get-role.dto";

export interface GetUserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
  UserRole?: GetUserRoleDto[];
}
