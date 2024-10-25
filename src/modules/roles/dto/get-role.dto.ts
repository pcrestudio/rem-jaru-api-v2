export interface GetUserRoleDto {
  userId: number;
  roleId: number;
  role?: GetRoleDto;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GetRoleDto {
  name: string;
  title: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}
