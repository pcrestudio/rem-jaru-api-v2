export class CreateUserDto {
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  authMethod: string;
  password?: string;
}
