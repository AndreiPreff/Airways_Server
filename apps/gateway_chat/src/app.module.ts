import { Module } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/prisma.service';
import { ChatController } from './chat/chat.controller';
import { ChatGateway } from './chat/chat.gateway';
import { RedisService } from './redis/redis.service'; // Убедитесь, что путь к файлу верный

@Module({
  controllers: [ChatController],
  providers: [ChatGateway, PrismaService, RedisService],
})
export class AppModule {}
