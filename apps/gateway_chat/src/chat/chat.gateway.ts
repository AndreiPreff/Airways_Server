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

  async handleConnection(@ConnectedSocket() client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId !== undefined) {
      const roomId = userId;
      const roomExists = await this.redisService.roomExists(roomId);

      if (roomExists) {
        client.join(roomId);
        await this.redisService.updateRoomStatus(roomId, 'active');

        this.server.emit('chatActivated', { userId, roomId });
      } else {
        await this.redisService.hmset(`room:${roomId}:status`, {
          status: 'active',
        });
        client.join(roomId);
      }
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      const roomId = userId;
      await this.redisService.updateRoomStatus(roomId, 'inactive');
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: { senderId: string; content: string; roomId: string },
  ): Promise<void> {
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

    this.server.to(data.roomId).emit('message', {
      senderId: data.senderId,
      content: data.content,
      roomId: data.roomId,
    });
  }
}
