import { Module } from '@nestjs/common';
import { GatewayChatController } from './gateway_chat.controller';
import { GatewayChatService } from './gateway_chat.service';

@Module({
  imports: [],
  controllers: [GatewayChatController],
  providers: [GatewayChatService],
})
export class GatewayChatModule {}
