import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';

import { Role } from '@prisma/client';
import { UserSessionDto } from 'apps/gateway_api/src/domain/dtos/user-session.dto';
import { UserDto } from 'apps/gateway_api/src/domain/dtos/user.dto';
import { CurrentUser } from 'libs/security/decorators/current-user.decorator';
import { Roles } from 'libs/security/decorators/roles.decorator';
import { UpdateUserForm } from './domain/update-user.form';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.USER)
  @Get('/profile')
  async findUser(@CurrentUser() currentUser: UserSessionDto) {
    const user = await this.usersService.findById(currentUser.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserDto.fromEntity(user);
  }

  @Roles(Role.ADMIN)
  @Get(':userId')
  async findById(@Param('userId') userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(
        `User with the id of ${userId} does not exist.`,
      );
    }
    return UserDto.fromEntity(user);
  }

  @Roles(Role.ADMIN)
  @Get()
  async findAll() {
    const entities = await this.usersService.findAll();
    return UserDto.fromEntities(entities);
  }

  @Roles(Role.ADMIN)
  @Patch(':userId')
  async update(@Param('userId') userId: string, @Body() body: UpdateUserForm) {
    const form = UpdateUserForm.from(body);
    const errors = await UpdateUserForm.validate(form);
    if (errors) {
      throw new BadRequestException();
    }
    const entity = await this.usersService.update(userId, form);
    if (!entity) {
      throw new ConflictException();
    }
    return UserDto.fromEntity(entity);
  }

  @Roles(Role.ADMIN)
  @Delete(':userId')
  async delete(@Param('userId') userId: string) {
    const entity = await this.usersService.delete(userId);
    if (!entity) {
      throw new ConflictException();
    }
    return UserDto.fromEntity(entity);
  }
}
