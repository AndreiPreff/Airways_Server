import { Injectable } from '@nestjs/common';

import { User } from '@prisma/client';
import { PrismaService } from 'libs/prisma/prisma.service';

@Injectable()
export class UsersRepo {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    user: Pick<User, 'email' | 'first_name' | 'last_name' | 'password'>,
  ): Promise<User> {
    return await this.prisma.user.create({
      data: user,
    });
  }

  async findAll(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async findById(user: Pick<User, 'id'>): Promise<User> {
    return await this.prisma.user.findUnique({
      where: { id: user.id },
    });
  }

  async findByEmail(user: Pick<User, 'email'>): Promise<User> {
    return await this.prisma.user.findUnique({
      where: { email: user.email },
    });
  }

  async update(user: Partial<User>): Promise<User> {
    return await this.prisma.user.update({
      where: { id: user.id },
      data: user,
    });
  }

  async delete(user: Pick<User, 'id'>): Promise<User> {
    return await this.prisma.user.delete({ where: { id: user.id } });
  }

  async updatePassword(user: Pick<User, 'id' | 'password'>): Promise<User> {
    return await this.prisma.user.update({
      where: { id: user.id },
      data: { password: user.password },
    });
  }
}
