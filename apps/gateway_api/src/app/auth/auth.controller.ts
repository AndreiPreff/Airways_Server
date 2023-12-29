import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from 'apps/gateway_api/src/app/users/users.service';
import { UserSessionDto } from 'apps/gateway_api/src/domain/dtos/user-session.dto';
import { CurrentUser } from 'libs/security/decorators/current-user.decorator';
import { Public } from 'libs/security/decorators/public.decorator';
import { RefreshTokenGuard } from 'libs/security/guards/refresh-token.guard';
import { AuthService } from './auth.service';
import { LoginForm } from './domain/login.form';
import { ResetPasswordForm } from './domain/reset-password.form';
import { UserDto } from '../../domain/dtos/user.dto';
import { CreateUserForm } from '../users/domain/create-user.form';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post()
  async create(@Body() body: CreateUserForm) {
    const form = CreateUserForm.from(body);
    const errors = await CreateUserForm.validate(form);
    if (errors) {
      throw new BadRequestException();
    }
    const userExists = await this.usersService.findByEmail(body.email);
    if (userExists) {
      throw new ConflictException(
        'A user with the provided email already exists.',
      );
    }
    const entity = await this.usersService.create(form);
    if (!entity) {
      throw new ConflictException();
    }
    return UserDto.fromEntity(entity);
  }

  @Public()
  @Post('login')
  async login(@Body() body: LoginForm) {
    const form = LoginForm.from(body);
    const errors = await LoginForm.validate(form);
    if (errors) {
      throw new BadRequestException();
    }

    const user = await this.usersService.findByEmail(form.email);
    if (!user) throw new NotFoundException('User not found');

    const isValid = await this.authService.comparePasswords(
      form.password,
      user,
    );
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
    }
    const refreshTokenMatches = await this.authService.compareRefreshTokens(
      currentUser.refreshToken,
      user,
    );
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Refresh token is not valid');
    }
    return this.authService.authenticate(user);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordForm) {
    const form = ResetPasswordForm.from(body);
    const errors = await ResetPasswordForm.validate(form);
    if (errors) {
      throw new BadRequestException('Validation failed');
    }
    const user = await this.usersService.findByEmail(body.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersService.resetPassword(user, form.password);

    return { message: 'Password reset successfully' };
  }
}
