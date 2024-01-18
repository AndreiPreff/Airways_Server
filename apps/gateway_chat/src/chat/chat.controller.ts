import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/prisma.service';

@Controller('chat')
export class ChatController {
  constructor(private prisma: PrismaService) {}

  @Get(':userId')
  async loadHistory(@Param('userId') userId: string) {
    try {
      const messages = await this.prisma.message.findMany({
        where: { roomId: userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      return messages;
    } catch (error) {
      console.error('Failed to fetch message history:', error);
      return [];
    }
  }
}
