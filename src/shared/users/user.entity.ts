// src/users/user.entity.ts
export class User {
  id: number;
  email: string;
  password: string | null;
  name?: string;
  roles: string[];
  otpSecret?: string;
}
