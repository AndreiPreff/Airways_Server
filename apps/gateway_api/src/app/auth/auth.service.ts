import { Injectable } from '@nestjs/common';

import { User } from '@prisma/client';
import { TokensDto } from 'apps/gateway_api/src/domain/dtos/tokens.dto';
import { UsersRepo } from 'apps/gateway_api/src/domain/repos/users.repo';
import { SecurityService } from 'libs/security/security.service';

@Injectable()
export class AuthService {
  constructor(
    private usersRepo: UsersRepo,
    private securityService: SecurityService,
  ) {}

  async authenticate(
    user: Pick<User, 'email' | 'role' | 'id'>,
  ): Promise<TokensDto> {
    const [accessToken, refreshToken] = await this.generateTokens(user);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      role: user.role,
    };
  }

  async comparePasswords(formPassword: string, user: User): Promise<boolean> {
    return this.securityService.comparePasswords(formPassword, user.password);
  }

  async logout(user: Pick<User, 'id' | 'refreshToken'>): Promise<User> {
    return this.usersRepo.update(user);
  }

  async compareRefreshTokens(
    refreshToken: string,
    user: User,
  ): Promise<boolean> {
    return this.securityService.compareRefreshTokens(
      refreshToken,
      user.refreshToken,
    );
  }

  private async generateTokens(user: Pick<User, 'email' | 'role' | 'id'>) {
    const [accessToken, refreshToken] = await Promise.all([
      this.securityService.getAccessToken(user),
      this.securityService.getAndSaveRefreshToken(user),
    ]);

    return [accessToken, refreshToken];
  }
}
