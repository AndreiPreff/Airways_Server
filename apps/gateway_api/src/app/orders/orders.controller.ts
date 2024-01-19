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
import { OrderWithTicketsDto } from '../../domain/dtos/order-with-tickets.dto';
import { OrderDto } from '../../domain/dtos/order.dto';
import { TicketInfoDto } from '../../domain/dtos/ticketInfo.dto';
import { UserSessionDto } from '../../domain/dtos/user-session.dto';
import { UpdateOrderForm } from './domain/update-order.form';
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
  @Get('getOrderTickets/:id')
  async getAllOrderTickets(@Param('id') orderId: string): Promise<any> {
    const tickets = await this.ordersService.getAllOrderTickets({
      id: orderId,
    });
    return TicketInfoDto.fromEntities(tickets)!;
  }

  @Roles(Role.MANAGER, Role.USER)
  @Get('getAllUserOrders')
  async getAllOrders(
    @CurrentUser() currentUser: UserSessionDto,
  ): Promise<any[]> {
    const ordersWithTickets = await this.ordersService.getAllOrders({
      userId: currentUser.sub,
    });

    return OrderWithTicketsDto.fromEntities(ordersWithTickets);
  }

  @Roles(Role.MANAGER, Role.USER)
  @Get('getBookedOrders')
  async getBookedOrders(
    @CurrentUser() currentUser: UserSessionDto,
  ): Promise<any[]> {
    const ordersWithTickets = await this.ordersService.getBookedOrders({
      userId: currentUser.sub,
    });

    return OrderWithTicketsDto.fromEntities(ordersWithTickets);
  }

  @Roles(Role.MANAGER, Role.USER)
  @Patch(':id')
  async updateOrder(
    @Param('id') orderId: string,
    @Body() body: UpdateOrderForm,
  ): Promise<OrderDto> {
    const form = UpdateOrderForm.from(body);
    const errors = await UpdateOrderForm.validate(form);

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
