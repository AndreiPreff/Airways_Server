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
    await this.client.hmset(key, value);
  }

  async getAllChats(): Promise<{ [roomId: string]: string }> {
    const keys = await this.client.keys('room:*:status');
    const chatStatusMap: { [roomId: string]: string } = {};

    await Promise.all(
      keys.map(async (key) => {
        const roomId = key.split(':')[1];
        const status = await this.hgetall(key);
        chatStatusMap[roomId] = status?.status || 'unknown';
      }),
    );

    return chatStatusMap;
  }

  async roomExists(roomId: string): Promise<boolean> {
    const exists = await this.client.exists(`room:${roomId}:status`);
    return exists === 1;
  }

  async updateRoomStatus(
    roomId: string,
    status: string,
  ): Promise<Record<string, string>> {
    await this.client.hset(`room:${roomId}:status`, 'status', status);

    const updatedRoom = await this.client.hgetall(`room:${roomId}:status`);

    return updatedRoom;
  }

  private async hgetall(key: string): Promise<{ [key: string]: string }> {
    return await this.client.hgetall(key);
  }

  private async publish(channel: string, message: string): Promise<number> {
    return await this.client.publish(channel, message);
  }
}
