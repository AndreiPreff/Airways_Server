import {
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common';
import { UserSessionDto } from 'apps/gateway_api/src/domain/dtos/user-session.dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserSessionDto;
  },
);