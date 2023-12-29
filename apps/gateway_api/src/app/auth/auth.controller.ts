import { Controller, Get, Post, Body, UseGuards, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { UsersService } from 'apps/gateway_api/src/app/users/users.service';
import { Public } from 'libs/security/decorators/public.decorator';
import { CurrentUser } from 'libs/security/decorators/current-user.decorator';
import { UserSessionDto } from 'apps/gateway_api/src/domain/dtos/user-session.dto';
import { LoginForm } from './domain/login.form';
import { RefreshTokenGuard } from 'libs/security/guards/refresh-token.guard';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Public()
  @Post('login')
  async login(@Body() body: LoginForm) {
    const form = LoginForm.from(body);
    const errors = await LoginForm.validate(form);
    if (errors) {
      throw new BadRequestException();
    };

    const user = await this.usersService.findByEmail(form.email);
    if (!user) throw new NotFoundException('User not found');

    const isValid = await this.authService.comparePasswords(form.password, user)    
    if (!isValid) throw new UnauthorizedException('Invalid password');

    return this.authService.authenticate(user);
  }

  @Post('logout')
  async logout(@CurrentUser() currentUser: UserSessionDto) {
    await this.authService.logout(currentUser.sub);
    return;
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshTokens(@CurrentUser() currentUser: UserSessionDto) {
    const user = await this.usersService.findById(currentUser.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!user.refreshToken) {
      throw new UnauthorizedException('Refresh token is not present');
    };
    const refreshTokenMatches = await this.authService.compareRefreshTokens(currentUser.refreshToken, user);
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Refresh token is not valid');
    }
    return this.authService.authenticate(user);
  }
}
