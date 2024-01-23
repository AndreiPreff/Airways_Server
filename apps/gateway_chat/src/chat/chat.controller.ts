import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Controller('chat')
export class ChatController {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  @Get(':roomId')
  async loadHistory(@Param('roomId') roomId: string) {
    try {
      const messages = await this.prisma.message.findMany({
        where: { roomId: roomId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      return messages;
    } catch (error) {
      console.error('Failed to fetch message history:', error);
      return [];
    }
  }
  @Get()
  async getAllChats() {
    try {
      const chats = await this.redisService.getAllChats();
      return chats;
    } catch (error) {
      console.error('Failed to fetch active chats:', error);
      return [];
    }
  }
}
