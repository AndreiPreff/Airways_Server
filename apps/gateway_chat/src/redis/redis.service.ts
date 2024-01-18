import { Injectable } from '@nestjs/common';
import * as Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis.Redis;

  constructor() {
    this.client = new Redis.default(process.env.REDIS_URL);
  }

  async hmset(key: string, value: Record<string, any>): Promise<void> {
    await this.client.hmset(key, value);
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
}
