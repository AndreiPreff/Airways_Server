import { Injectable } from '@nestjs/common';

import { SecurityService } from 'libs/security/security.service';
import { UsersRepo } from 'apps/gateway_api/src/domain/repos/users.repo';
import { User } from '@prisma/client';
import { TokensDto } from 'apps/gateway_api/src/domain/dtos/tokens.dto';


@Injectable()
export class AuthService {
  constructor(
    private usersRepo: UsersRepo, 
    private securityService: SecurityService
  ) {}

  async authenticate(user: Pick<User, 'email'| 'role' | 'id'>) {
    const [accessToken, refreshToken] = await Promise.all([
      this.securityService.getAccesToken(user),
      this.securityService.getAndSaveRefreshToken(user)
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken
    } as TokensDto;
  }

  async comparePasswords(formPassword: string, user: User) {
    return this.securityService.comparePasswords(formPassword, user.password);
  }

  async logout(userId: string) {
    return this.usersRepo.update(userId, { refreshToken: null });
  }

  async compareRefreshTokens(refreshToken: string, user: User) {
    return this.securityService.compareRefreshTokens(refreshToken, user.refreshToken);
  }
}
