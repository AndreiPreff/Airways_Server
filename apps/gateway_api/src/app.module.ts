import { Module } from '@nestjs/common';
import { I18nModule, I18nResolver, I18nJsonParser } from 'nestjs-i18n';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { ExecutionContext } from '@nestjs/common';

import { PrismaModule } from 'libs/prisma/prisma.module';
import { AuthModule } from './app/auth/auth.module';
import { UsersModule } from './app/users/users.module';
import { JwtAuthGuard } from 'libs/security/guards/jwt-auth.guard';
import { RolesGuard } from 'libs/security/guards/roles.guard';
import { FlightsModule } from './app/flights/flights.module';
import { OrdersModule } from './app/orders/orders.module';
import { TicketsModule } from './app/tickets/tickets.module';
import { APP_GUARD } from '@nestjs/core';
import { Logger } from '@nestjs/common';

export class CustomI18nResolver implements I18nResolver {
  resolve(_context: ExecutionContext): string | undefined {
    const language = 'en';
    return language;
  }
}

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    FlightsModule,
    TicketsModule,
    OrdersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: 'en',
        parser: I18nJsonParser,
        parserOptions: {
          path: path.join(__dirname, 'src/i18n/'),
          watch: true,
        },
      }),
      inject: [ConfigService],
      resolvers: [{ use: CustomI18nResolver, options: {} }],
      parser: I18nJsonParser,
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
    Logger,
  ],
})
export class AppModule {}
