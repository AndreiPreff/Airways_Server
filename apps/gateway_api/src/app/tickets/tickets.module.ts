import { Module } from '@nestjs/common';
import { TicketsRepo } from '../../domain/repos/tickets.repo';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { PrismaModule } from 'libs/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketsRepo],
})
export class TicketsModule {}
