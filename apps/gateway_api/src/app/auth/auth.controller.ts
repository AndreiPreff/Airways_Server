import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';

import { UsersService } from 'apps/gateway_api/src/app/users/users.service';
import { UserSessionDto } from 'apps/gateway_api/src/domain/dtos/user-session.dto';
import { CurrentUser } from 'libs/security/decorators/current-user.decorator';
import { Public } from 'libs/security/decorators/public.decorator';
import { RefreshTokenGuard } from 'libs/security/guards/refresh-token.guard';
import { CreateUserForm } from '../users/domain/create-user.form';
import { AuthService } from './auth.service';
import { LoginForm } from './domain/login.form';
import { ResetPasswordForm } from './domain/reset-password.form';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'Create user' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiConflictResponse({ description: 'Conflict' })
  @ApiOkResponse({ description: 'User created' })
  @Public()
  @Post()
  async create(@Body() body: CreateUserForm) {
    const form = CreateUserForm.from(body);
    const errors = await CreateUserForm.validate(form);
    if (errors) {
      throw new BadRequestException();
    }
    const userExists = await this.usersService.findByEmail({
      email: body.email,
    });
    if (userExists) {
      throw new ConflictException(
        'A user with the provided email already exists.',
      );
    }
    const entity = await this.usersService.create(form);
    if (!entity) {
      throw new ConflictException();
    }
    return this.authService.authenticate(entity);
  }

  @ApiOperation({ summary: 'User login' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiForbiddenResponse({ description: 'Invalid password' })
  @Public()
  @Post('login')
  async login(@Body() body: LoginForm) {
    const form = LoginForm.from(body);
    const errors = await LoginForm.validate(form);
    if (errors) {
      throw new BadRequestException();
    }

    const user = await this.usersService.findByEmail({ email: form.email });
    if (!user) throw new NotFoundException('User not found');

    const isValid = await this.authService.comparePasswords(
      form.password,
      user,
    );
    if (!isValid)
      throw new HttpException('Invalid password', HttpStatus.FORBIDDEN);

    return this.authService.authenticate(user);
  }

  @ApiOperation({ summary: 'User logout' })
  @ApiOkResponse({ description: 'Logout successful' })
  @Post('logout')
  async logout(@CurrentUser() currentUser: UserSessionDto) {
    await this.authService.logout({ id: currentUser.sub, refreshToken: null });
    return true;
  }

  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @Public()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshTokens(@CurrentUser() currentUser: UserSessionDto) {
    const user = await this.usersService.findById({ id: currentUser.sub });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.FORBIDDEN);
    }
    if (!user.refreshToken) {
      throw new HttpException(
        'Refresh token is not present',
        HttpStatus.FORBIDDEN,
      );
    }
    const refreshTokenMatches = await this.authService.compareRefreshTokens(
      currentUser.refreshToken,
      user,
    );
    if (!refreshTokenMatches) {
      throw new HttpException(
        'Refresh token is not valid',
        HttpStatus.FORBIDDEN,
      );
    }
    return this.authService.authenticate(user);
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiOkResponse({ description: 'Password reset successfully' })
  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordForm) {
    const form = ResetPasswordForm.from(body);
    const errors = await ResetPasswordForm.validate(form);
    if (errors) {
      throw new BadRequestException('Validation failed');
    }
    const user = await this.usersService.findByEmail({ email: body.email });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersService.resetPassword({
      id: user.id,
      password: form.password,
    });

    return { message: 'Password reset successfully' };
  }
}
