import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from 'libs/security/decorators/current-user.decorator';
import { Roles } from 'libs/security/decorators/roles.decorator';
import { OrderDto } from '../../domain/dtos/order.dto';
import { TicketDto } from '../../domain/dtos/ticket.dto';
import { UserSessionDto } from '../../domain/dtos/user-session.dto';
import { CreateOrderForm } from './domain/create-order.form';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(Role.MANAGER, Role.USER)
  @Post()
  async createOrder(
    @CurrentUser() currentUser: UserSessionDto,
  ): Promise<OrderDto> {
    const createdOrder = await this.ordersService.createOrder({
      userId: currentUser.sub,
    });
    return OrderDto.fromEntity(createdOrder)!;
  }

  @Roles(Role.MANAGER, Role.USER)
  @Get(':id')
  async getAllOrderTickets(@Param('id') orderId: string): Promise<TicketDto[]> {
    const tickets = await this.ordersService.getAllOrderTickets({
      id: orderId,
    });
    console.log(tickets);
    return tickets;
    // return TicketDto.fromEntities(tickets)!;
  }

  @Roles(Role.MANAGER, Role.USER)
  @Patch(':id')
  async updateOrder(
    @Param('id') orderId: string,
    @Body() body: CreateOrderForm,
  ): Promise<OrderDto> {
    const form = CreateOrderForm.from(body);
    const errors = await CreateOrderForm.validate(form);

    if (errors) {
      throw new BadRequestException(errors);
    }
    const updatedOrder = await this.ordersService.updateOrderStatus({
      id: orderId,
      status: body.status,
    });
    return OrderDto.fromEntity(updatedOrder);
  }
}
