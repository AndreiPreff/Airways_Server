import { Test, TestingModule } from '@nestjs/testing';
import { GatewayChatController } from './gateway_chat.controller';
import { GatewayChatService } from './gateway_chat.service';

describe('GatewayChatController', () => {
  let gatewayChatController: GatewayChatController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GatewayChatController],
      providers: [GatewayChatService],
    }).compile();

    gatewayChatController = app.get<GatewayChatController>(GatewayChatController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(gatewayChatController.getHello()).toBe('Hello World!');
    });
  });
});
