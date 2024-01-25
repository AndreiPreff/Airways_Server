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
  ApiCreatedResponse,
} from '@nestjs/swagger';

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
import path from 'path';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  @ApiOperation({ summary: "User's signup" })
  @ApiCreatedResponse({
    description: 'User successfully created',
    schema: {
      example: {
        user: {},
        accessToken: `accessToken string`,
        refreshToken: `refreshToken string`,
        role: `USER`,
      },
    },
  })
  @ApiConflictResponse({
    description: 'User exists',
    schema: {
      example: {
        message: 'A user with the provided email already exists.',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  @ApiBadRequestResponse({
    description: "User's creation failed",
    schema: {
      example: {
        message: [
          'email must be an email',
          'password must be longer than or equal to 8 characters',
        ],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
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

  @ApiOperation({ summary: "User's login" })
  @ApiBadRequestResponse({
    description: 'Enter a valid email',
    schema: {
      example: {
        message: ['email must be an email'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        message: 'User not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Wrong password',
    schema: {
      example: {
        message: 'Invalid password',
        statusCode: 403,
      },
    },
  })
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
        await this.i18n.translate('auth.userNotFound')
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

  @ApiOperation({ summary: 'User logout' })
  @ApiOkResponse({ description: 'Logout successful' })
  @Post('logout')
  async logout(@CurrentUser() currentUser: UserSessionDto): Promise<boolean> {
    await this.authService.logout({ id: currentUser.sub, refreshToken: null });
    return true;
  }

  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
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

  @ApiOperation({ summary: 'Reset password' })
  @ApiOkResponse({
    description: 'Password reset',
    schema: {
      example: {
        message: 'Password reset successfully',
        statusCode: 201,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        message: 'User not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    schema: {
      example: {
        message: ['email must be an email', 'password should not be empty'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
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
