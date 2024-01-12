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

  async findById(user: Pick<User, 'id'>) {
    return this.usersRepo.findById(user);
  }

  async findByEmail(user: Pick<User, 'email'>) {
    return this.usersRepo.findByEmail(user);
  }

  async update(user: Pick<User, 'id' | 'password' | 'refreshToken'>) {
    if (user.password) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
      user.refreshToken = null;
    }
    return this.usersRepo.update(user);
  }

  async delete(user: Pick<User, 'id'>) {
    return this.usersRepo.delete(user);
  }

  async resetPassword(user: Pick<User, 'id' | 'password'>) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await this.usersRepo.update({ id: user.id, password: hashedPassword });
  }
}
