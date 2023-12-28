import { Controller, Get, Post, Patch, Delete, Body, Param, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

import { UsersService } from './users.service';
import { UserDto } from 'apps/gateway_api/src/domain/dtos/user.dto';
import { CreateUserForm } from './domain/create-user.form';
import { UpdateUserForm } from './domain/update-user.form';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() body: CreateUserForm) {
    const form = CreateUserForm.from(body);
    const errors = await CreateUserForm.validate(form);
    if (errors) {
      throw new BadRequestException();
    }
    const entity = await this.usersService.create(form);
    if (!entity) {
      throw new ConflictException();
    }
    return UserDto.fromEntity(entity);
  }

  @Get(':userId')
  async findById(@Param('userId') userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with the id of ${userId} does not exist.`);
    }
    return UserDto.fromEntity(user);
  }

  @Get()
  async findAll() {
    const entities = await this.usersService.findAll();
    return UserDto.fromEntities(entities);
  }

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

  @Delete(':userId')
  async delete(@Param('userId') userId: string) {
    const entity = await this.usersService.delete(userId);
    if (!entity) {
      throw new ConflictException();
    }
    return UserDto.fromEntity(entity);
  }
}