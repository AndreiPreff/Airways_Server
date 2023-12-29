import { Module } from '@nestjs/common';

import { UsersRepo } from 'apps/gateway_api/src/domain/repos/users.repo';
import { PrismaModule } from 'libs/prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService, UsersRepo],
  controllers: [UsersController],
  imports: [PrismaModule],
  exports: [UsersService, UsersRepo],
})
export class UsersModule {}
