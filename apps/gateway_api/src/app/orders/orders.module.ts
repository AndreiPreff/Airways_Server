import { Module } from '@nestjs/common';
import { PrismaModule } from 'libs/prisma/prisma.module';
import { FlightsRepo } from '../../domain/repos/flights.repo';
import { OrdersRepo } from '../../domain/repos/orders.repo';
import { TicketsRepo } from '../../domain/repos/tickets.repo';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { UsersRepo } from '../../domain/repos/users.repo';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepo, TicketsRepo, FlightsRepo, UsersRepo],
})
export class OrdersModule {}
