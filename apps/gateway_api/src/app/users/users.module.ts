import { Module } from '@nestjs/common';

import { PrismaModule } from 'libs/prisma/prisma.module';
import { UsersRepo } from 'apps/gateway_api/src/domain/repos/users.repo';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersService, UsersRepo],
  controllers: [UsersController],
  imports: [PrismaModule],
  exports: [UsersService, UsersRepo]
})
export class UsersModule {}