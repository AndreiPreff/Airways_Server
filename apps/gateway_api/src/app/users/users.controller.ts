import { 
  Controller, 
  Get, Post, Patch, Delete, 
  Body, Param, 
  NotFoundException, BadRequestException, ConflictException 
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserForm } from './domain/create-user.form';
import { UpdateUserForm } from './domain/update-user.form';
import { UserDto } from 'apps/gateway_api/src/domain/dtos/user.dto';
import { Role } from '@prisma/client';
import { Roles } from 'libs/security/decorators/roles.decorator';
import { Public } from 'libs/security/decorators/public.decorator';
import { CurrentUser } from 'libs/security/decorators/current-user.decorator';
import { UserSessionDto } from 'apps/gateway_api/src/domain/dtos/user-session.dto';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
      throw new ConflictException('A user with the provided email already exists.');
    };
    const entity = await this.usersService.create(form);
    if (!entity) {
      throw new ConflictException();
    }
    return UserDto.fromEntity(entity);
  }

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
      throw new NotFoundException(`User with the id of ${userId} does not exist.`);
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