import { Module } from '@nestjs/common';
import { PrismaModule } from 'libs/prisma/prisma.module';
import { FlightsRepo } from '../../domain/repos/flights.repo';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { SecurityModule } from 'libs/security/security.module';

@Module({
  imports: [PrismaModule, SecurityModule],
  controllers: [FlightsController],
  providers: [FlightsService, FlightsRepo],
})
export class FlightsModule {}
