import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { SecurityService } from './security.service';
import { UsersModule } from 'apps/gateway_api/src/app/users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { RefreshTokenStrategy } from './refresh-jwt.strategy';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.development.env'
    }),
    PassportModule,
    JwtModule.register({}),
    UsersModule
  ],
  providers: [SecurityService, JwtStrategy, RefreshTokenStrategy],
  exports: [SecurityService]
})
export class SecurityModule {}
