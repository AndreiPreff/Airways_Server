import { Injectable } from '@nestjs/common';

import { PrismaService } from 'libs/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersRepo {
  constructor(private readonly prisma: PrismaService) { }

  async create(user: Pick<User, 'email' | 'first_name' | 'last_name' | 'password'>) {
    return this.prisma.user.create({
      data: user
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findById(userId: string) {
    return this.prisma.user.findUnique({
      where: {id: userId}
    })
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {email: email}
    })
  }

  async update(userId: string, user: Partial<User>) {
    return this.prisma.user.update({
      where: { id: userId },
      data: user,
    });
  }

  async delete(userId: string) {
    return this.prisma.user.delete({ where: { id: userId } });
  }
}