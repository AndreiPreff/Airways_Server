import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './app/users/users.module';
import { PrismaModule } from 'libs/prisma/prisma.module';
import { AuthModule } from './app/auth/auth.module';

import { JwtAuthGuard } from 'libs/security/guards/jwt-auth.guard';
import { RolesGuard } from 'libs/security/guards/roles.guard';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
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
