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

import { UsersService } from 'apps/gateway_api/src/app/users/users.service';
import { UserSessionDto } from 'apps/gateway_api/src/domain/dtos/user-session.dto';
import { CurrentUser } from 'libs/security/decorators/current-user.decorator';
import { Public } from 'libs/security/decorators/public.decorator';
import { RefreshTokenGuard } from 'libs/security/guards/refresh-token.guard';
import { TokensDto } from '../../domain/dtos/tokens.dto';
import { CreateUserForm } from '../users/domain/create-user.form';
import { AuthService } from './auth.service';
import { LoginForm } from './domain/login.form';
import { ResetPasswordForm } from './domain/reset-password.form';
import { I18nService } from 'nestjs-i18n';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

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
      throw new ConflictException(await this.i18n.translate('auth.userExists'));
    }
    const entity = await this.usersService.create(form);
    if (!entity) {
      throw new ConflictException();
    }
    return this.authService.authenticate(entity);
  }

  @Public()
  @Post('login')
  async login(@Body() body: LoginForm): Promise<TokensDto> {
    const form = LoginForm.from(body);
    const errors = await LoginForm.validate(form);
    if (errors) {
      throw new BadRequestException();
    }

    const user = await this.usersService.findByEmail({ email: form.email });
    if (!user)
      throw new NotFoundException(
        await this.i18n.translate('auth.userNotFound'),
      );

    const isValid = await this.authService.comparePasswords(
      form.password,
      user,
    );
    if (!isValid)
      throw new HttpException(
        await this.i18n.translate('auth.invalidPassword'),
        HttpStatus.FORBIDDEN,
      );

    return this.authService.authenticate(user);
  }

  @Post('logout')
  async logout(@CurrentUser() currentUser: UserSessionDto): Promise<boolean> {
    await this.authService.logout({ id: currentUser.sub, refreshToken: null });
    return true;
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshTokens(
    @CurrentUser() currentUser: UserSessionDto,
  ): Promise<TokensDto> {
    const user = await this.usersService.findById({ id: currentUser.sub });
    if (!user) {
      throw new HttpException(
        await this.i18n.translate('auth.userNotFound'),
        HttpStatus.FORBIDDEN,
      );
    }
    if (!user.refreshToken) {
      throw new HttpException(
        await this.i18n.translate('auth.noRefreshToken'),
        HttpStatus.FORBIDDEN,
      );
    }
    const refreshTokenMatches = await this.authService.compareRefreshTokens(
      currentUser.refreshToken,
      user,
    );
    if (!refreshTokenMatches) {
      throw new HttpException(
        await this.i18n.translate('auth.refreshTokenNotValid'),
        HttpStatus.FORBIDDEN,
      );
    }
    return this.authService.authenticate(user);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordForm) {
    const form = ResetPasswordForm.from(body);
    const errors = await ResetPasswordForm.validate(form);
    if (errors) {
      throw new BadRequestException(
        await this.i18n.translate('auth.validationFailed'),
      );
    }
    const user = await this.usersService.findByEmail({ email: body.email });

    if (!user) {
      throw new NotFoundException(
        await this.i18n.translate('auth.userNotFound'),
      );
    }
    await this.usersService.resetPassword({
      id: user.id,
      password: form.password,
    });

    const message = await this.i18n.translate('auth.passwordResetSuccess');
    return { message };
  }
}
