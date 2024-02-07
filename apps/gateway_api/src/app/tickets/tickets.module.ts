import { Module } from '@nestjs/common';
import { PrismaModule } from 'libs/prisma/prisma.module';
import { OrdersRepo } from '../../domain/repos/orders.repo';
import { TicketsRepo } from '../../domain/repos/tickets.repo';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { FlightsRepo } from '../../domain/repos/flights.repo';

@Module({
  imports: [PrismaModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketsRepo, OrdersRepo, FlightsRepo],
})
export class TicketsModule {}
