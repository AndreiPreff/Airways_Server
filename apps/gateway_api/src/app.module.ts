import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { I18nModule } from 'nestjs-i18n';
import { I18nConfigService } from './config/i18n.config';

import { PrismaModule } from 'libs/prisma/prisma.module';
import { AuthModule } from './app/auth/auth.module';
import { UsersModule } from './app/users/users.module';

import { JwtAuthGuard } from 'libs/security/guards/jwt-auth.guard';
import { RolesGuard } from 'libs/security/guards/roles.guard';
import { FlightsModule } from './app/flights/flights.module';
import { OrdersModule } from './app/orders/orders.module';
import { TicketsModule } from './app/tickets/tickets.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    FlightsModule,
    TicketsModule,
    OrdersModule,
    I18nModule.forRootAsync({
      useClass: I18nConfigService,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
