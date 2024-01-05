import { Controller, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from 'libs/security/decorators/current-user.decorator';
import { Roles } from 'libs/security/decorators/roles.decorator';
import { OrderDto } from '../../domain/dtos/order.dto';
import { UserSessionDto } from '../../domain/dtos/user-session.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(Role.MANAGER, Role.USER)
  @Post()
  async createOrder(
    @CurrentUser() currentUser: UserSessionDto,
  ): Promise<OrderDto> {
    const createdOrder = await this.ordersService.createOrder(currentUser.sub);
    return OrderDto.fromEntity(createdOrder)!;
  }
}
