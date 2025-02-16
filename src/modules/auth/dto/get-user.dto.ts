import { GetUserRoleDto } from "../../roles/dto/get-role.dto";
import { GetMasterOptionsDto } from "../../master/dto/get-master-options.dto";

export interface GetUserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  displayName?: string;
  authMethod?: string;
  createdAt?: Date;
  updatedAt?: Date;
  studioId?: number;
  studio?: GetMasterOptionsDto;
  UserRole?: GetUserRoleDto[];
}
