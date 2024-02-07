import { Module } from '@nestjs/common';

import { UsersRepo } from 'apps/gateway_api/src/domain/repos/users.repo';
import { PrismaModule } from 'libs/prisma/prisma.module';
import { OrdersRepo } from '../../domain/repos/orders.repo';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService, UsersRepo, OrdersRepo],
  controllers: [UsersController],
  imports: [PrismaModule],
  exports: [UsersService, UsersRepo],
})
export class UsersModule {}
