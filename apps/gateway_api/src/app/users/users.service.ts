import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersRepo } from 'apps/gateway_api/src/domain/repos/users.repo';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private usersRepo: UsersRepo) {}

  async create(
    user: Pick<User, 'email' | 'first_name' | 'last_name' | 'password'>,
  ) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    return this.usersRepo.create({
      ...user,
      password: hashedPassword,
    });
  }

  async findAll() {
    return this.usersRepo.findAll();
  }

  async findById(userId: string) {
    return this.usersRepo.findById(userId);
  }

  async findByEmail(email: string) {
    return this.usersRepo.findByEmail(email);
  }

  async update(userId: string, user: Partial<User>) {
    if (user.password) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
      user.refreshToken = null;
    }
    return this.usersRepo.update(userId, user);
  }

  async delete(userId: string) {
    return this.usersRepo.delete(userId);
  }
}
