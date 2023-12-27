import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersRepo } from 'domain/repos/users.repo';
import { PrismaModule } from 'libs/prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';
import { SecurityService } from './security.service';

@Module({
  controllers: [],
  providers: [SecurityService, JwtStrategy, UsersRepo],
  imports: [PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get('JWT_SECRET'),
    }),
    })],
  exports: [SecurityService]
})
export class SecurityModule {}
