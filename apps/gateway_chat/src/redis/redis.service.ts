// redis.service.ts

import { Injectable } from '@nestjs/common';
import * as Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis.Redis;

  constructor() {
    this.client = new Redis.default({
      host: 'localhost',
      port: 6379,
    });
  }

  async hmset(key: string, value: Record<string, any>): Promise<void> {
    console.log(`Setting data for key ${key}:`, value);
    await this.client.hmset(key, value);
    console.log(`Data set successfully for key ${key}`);
  }

  async hmget(key: string, field: string): Promise<string> {
    return await this.client.hget(key, field);
  }

  async hgetall(key: string): Promise<{ [key: string]: string }> {
    return await this.client.hgetall(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async publish(channel: string, message: string): Promise<number> {
    return await this.client.publish(channel, message);
  }

  async subscribe(channel: string): Promise<void> {
    await this.client.subscribe(channel);
  }

  async getAllChats(): Promise<{ [roomId: string]: string }> {
    const keys = await this.client.keys('room:*:status');
    const chatStatusMap: { [roomId: string]: string } = {};

    // Получаем статус для каждой комнаты
    await Promise.all(
      keys.map(async (key) => {
        const roomId = key.split(':')[1];
        const status = await this.hgetall(key);
        chatStatusMap[roomId] = status?.status || 'unknown';
      }),
    );

    return chatStatusMap;
  }

  async getChatId(userId: string): Promise<string | null> {
    const key = `user:${userId}:chat`;
    const chatId = await this.client.get(key);
    return chatId;
  }

  async setChatId(userId: string, chatId: string): Promise<void> {
    const key = `user:${userId}:chat`;
    await this.client.set(key, chatId);
  }

  async roomExists(roomId: string): Promise<boolean> {
    const exists = await this.client.exists(`room:${roomId}:status`);
    return exists === 1;
  }

  async updateRoomStatus(
    roomId: string,
    status: string,
  ): Promise<Record<string, string>> {
    // Получаем текущую комнату
    const currentRoom = await this.client.hgetall(`room:${roomId}:status`);
    console.log(currentRoom, 'room with current status');

    // Обновляем только статус
    await this.client.hset(`room:${roomId}:status`, 'status', status);

    // Получаем обновленную комнату
    const updatedRoom = await this.client.hgetall(`room:${roomId}:status`);
    console.log(updatedRoom, 'room with updated status');

    return updatedRoom;
  }

  async notifyAdminRoomStatus(roomId: string, status: string): Promise<void> {
    const adminUserId = 'b0363f4e-ddcc-4d51-9a35-bad9d341866b'; // Замените на реальный идентификатор администратора
    const notification = JSON.stringify({ roomId, status });
    await this.publish(`admin:${adminUserId}`, notification);
  }
}
