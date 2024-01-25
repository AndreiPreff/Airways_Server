// import { Module } from '@nestjs/common';
// import {
//   AcceptLanguageResolver,
//   QueryResolver,
//   HeaderResolver,
//   CookieResolver,
//   I18nJsonLoader,
//   I18nModule,
// } from 'nestjs-i18n';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import * as path from 'path';

// import { PrismaModule } from 'libs/prisma/prisma.module';
// import { AuthModule } from './app/auth/auth.module';
// import { UsersModule } from './app/users/users.module';
// import { JwtAuthGuard } from 'libs/security/guards/jwt-auth.guard';
// import { RolesGuard } from 'libs/security/guards/roles.guard';
// import { FlightsModule } from './app/flights/flights.module';
// import { OrdersModule } from './app/orders/orders.module';
// import { TicketsModule } from './app/tickets/tickets.module';
// import { APP_GUARD } from '@nestjs/core';
// import { Logger } from '@nestjs/common';

// @Module({
//   imports: [
//     PrismaModule,
//     UsersModule,
//     AuthModule,
//     FlightsModule,
//     TicketsModule,
//     OrdersModule,
//     ConfigModule.forRoot(),
//     I18nModule.forRoot({
//       fallbackLanguage: 'en',
//       loaderOptions: {
//         path: path.join(__dirname, 'i18n'),
//         watch: true,
//       },
//       resolvers: [
//         new QueryResolver(['lang', 'l']),
//         new HeaderResolver(['x-custom-lang']),
//         new CookieResolver(),
//         AcceptLanguageResolver,
//       ],
//     }),
//   ],

//   providers: [
//     {
//       provide: APP_GUARD,
//       useClass: JwtAuthGuard,
//     },
//     {
//       provide: APP_GUARD,
//       useClass: RolesGuard,
//     },
//     Logger,
//   ],
// })
// export class AppModule {}

import { Module } from '@nestjs/common';
import {
  AcceptLanguageResolver,
  QueryResolver,
  HeaderResolver,
  CookieResolver,
  I18nJsonLoader,
  I18nModule,
} from 'nestjs-i18n';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';

import { PrismaModule } from 'libs/prisma/prisma.module';
import { AuthModule } from './app/auth/auth.module';
import { UsersModule } from './app/users/users.module';

import { JwtAuthGuard } from 'libs/security/guards/jwt-auth.guard';
import { RolesGuard } from 'libs/security/guards/roles.guard';
import { FlightsModule } from './app/flights/flights.module';
import { OrdersModule } from './app/orders/orders.module';
import { TicketsModule } from './app/tickets/tickets.module';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    FlightsModule,
    TicketsModule,
    OrdersModule,
    ConfigModule.forRoot(),
    I18nModule.forRoot({
      fallbackLanguage: 'ru',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: path.join(__dirname, 'i18n'),
        watch: true,
      },
      resolvers: [
        new QueryResolver(['lang', 'l']),
        new HeaderResolver(['x-custom-lang']),
        new CookieResolver(),
        AcceptLanguageResolver,
      ],
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
