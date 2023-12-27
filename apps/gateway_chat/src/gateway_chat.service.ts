import { Injectable } from '@nestjs/common';

@Injectable()
export class GatewayChatService {
  getHello(): string {
    return 'Hello World!';
  }
}
