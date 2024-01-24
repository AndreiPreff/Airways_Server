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
    console.log(`Client connected: ${client.id}`);
    const userId = client.handshake.query.userId as string;

    if (userId) {
      const roomId = userId;

      // Проверяем, существует ли комната
      const roomExists = await this.redisService.roomExists(roomId);

      if (roomExists) {
        // Комната уже существует, подключаемся к ней
        client.join(roomId);
        console.log(`User ${userId} joined existing room: ${roomId}`);
        await this.redisService.updateRoomStatus(roomId, 'active'); // Обновляем статус комнаты
        await this.redisService.notifyAdminRoomStatus(roomId, 'active'); // Отправляем уведомление администратору

        this.server.emit('chatActivated', { userId, roomId });
      } else {
        // Создаем новую комнату
        await this.redisService.hmset(`room:${roomId}:status`, {
          status: 'active',
        });
        client.join(roomId);
        console.log(`User ${userId} created and joined new room: ${roomId}`);
      }
    } else {
      console.log('Missing userId in connection parameters');
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const userId = client.handshake.query.userId as string;
    const isManager = client.handshake.query.isManager as string;
    console.log(isManager);

    if (!isManager) {
      const roomId = userId;
      await this.redisService.updateRoomStatus(roomId, 'inactive');
      await this.redisService.notifyAdminRoomStatus(roomId, 'inactive');
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: { senderId: string; content: string; roomId: string },
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

    this.server.to(data.roomId).emit('message', {
      senderId: data.senderId,
      content: data.content,
      roomId: data.roomId,
    });
  }

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const messages = await this.prisma.message.findMany({
      where: { senderId: data.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    client.emit('loadHistory', messages);
  }

  @SubscribeMessage('chatDeactivated')
  async handleChatDeactivation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; roomId: string },
  ): Promise<void> {
    console.log(`Chat deactivated: User ${data.userId}, Room ${data.roomId}`);
    this.server.emit('chatDeactivated', data);
  }

  @SubscribeMessage('admin:adminUserId')
  async handleAdminNotification(
    @ConnectedSocket() client: Socket,
    payload: string,
  ): Promise<void> {
    try {
      const notification = JSON.parse(payload);
      console.log(
        `Room ${notification.roomId} has status: ${notification.status}`,
      );
    } catch (error) {
      console.error('Error parsing admin notification:', error);
    }
  }
}
