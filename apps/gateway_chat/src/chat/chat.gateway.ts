import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { PrismaService } from 'libs/prisma/prisma.service';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    await this.redisService.hmset(`session:${client.id}`, { status: 'active' });
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    await this.redisService.del(`session:${client.id}`);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: { senderId: string; content: string; roomId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    console.log('Received message:', data);

    const message = await this.prisma.message.create({
      data: {
        senderId: data.senderId,
        content: data.content,
        roomId: data.roomId,
      },
    });

    await this.redisService.hmset(`message:${message.id}`, {
      text: data.content,
    });

    this.server.emit('message', {
      senderId: data.senderId,
      content: data.content,
    });
  }

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    console.log(`User ${data.userId} joined the chat`);

    const messages = await this.prisma.message.findMany({
      where: { senderId: data.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    client.emit('loadHistory', messages);
  }

  @SubscribeMessage('leave')
  async handleLeave(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    console.log(`User ${data.userId} left the chat`);
  }
}
