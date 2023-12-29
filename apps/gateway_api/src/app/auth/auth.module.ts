import { Module } from '@nestjs/common';

import { UsersModule } from 'apps/gateway_api/src/app/users/users.module';
import { SecurityModule } from 'libs/security/security.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';


@Module({
  imports: [
    UsersModule,
    SecurityModule
  ],
  providers: [
    AuthService, 
  ],
  controllers: [AuthController]
})
export class AuthModule {}