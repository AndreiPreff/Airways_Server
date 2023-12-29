import { Role } from '@prisma/client';

export class UserSessionDto {
  email: string;
  sub: string;
  role: Role;
  refreshToken?: string;
}
