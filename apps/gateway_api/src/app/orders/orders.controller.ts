import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { CurrentUser } from 'libs/security/decorators/current-user.decorator';
import { Roles } from 'libs/security/decorators/roles.decorator';
import { I18nService } from 'nestjs-i18n';
import { OrderWithTicketsDto } from '../../domain/dtos/order-with-tickets.dto';
import { OrderDto } from '../../domain/dtos/order.dto';
import { TicketInfoDto } from '../../domain/dtos/ticketInfo.dto';
import { UserSessionDto } from '../../domain/dtos/user-session.dto';
import { UpdateOrderForm } from './domain/update-order.form';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly i18n: I18nService,
  ) {}

  @ApiOperation({ summary: 'Create a new order' })
  @ApiOkResponse({ description: 'Order successfully created' })
  @Roles(Role.MANAGER, Role.USER)
  @Post()
  async createOrder(
    @CurrentUser() currentUser: UserSessionDto,
  ): Promise<OrderDto> {
    try {
      const createdOrder = await this.ordersService.createOrder({
        userId: currentUser.sub,
      });
      return OrderDto.fromEntity(createdOrder)!;
    } catch (error) {
      const errorMessage = await this.i18n.translate('orders.createError');
      throw new BadRequestException(errorMessage);
    }
  }

  @ApiOperation({ summary: 'Get all tickets for a specific order' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiOkResponse({ description: 'List of tickets for the order' })
  @Roles(Role.MANAGER, Role.USER)
  @Get('getOrderTickets/:id')
  async getAllOrderTickets(
    @Param('id') orderId: string,
  ): Promise<TicketInfoDto[]> {
    const tickets = await this.ordersService.getAllOrderTickets({
      id: orderId,
    });
    return TicketInfoDto.fromEntities(tickets)!;
  }

  @ApiOperation({ summary: 'Get all orders for the current user' })
  @ApiOkResponse({ description: 'List of all orders for the user' })
  @Roles(Role.MANAGER, Role.USER)
  @Get('getAllUserOrders')
  async getAllOrders(
    @CurrentUser() currentUser: UserSessionDto,
  ): Promise<OrderWithTicketsDto[]> {
    const ordersWithTickets = await this.ordersService.getAllOrders({
      userId: currentUser.sub,
    });

    return OrderWithTicketsDto.fromEntities(ordersWithTickets);
  }

  @ApiOperation({ summary: 'Get all booked orders for the current user' })
  @ApiOkResponse({ description: 'List of booked orders for the user' })
  @Roles(Role.MANAGER, Role.USER)
  @Get('getBookedOrders')
  async getBookedOrders(
    @CurrentUser() currentUser: UserSessionDto,
  ): Promise<OrderWithTicketsDto[]> {
    const ordersWithTickets = await this.ordersService.getBookedOrders({
      userId: currentUser.sub,
    });

    return OrderWithTicketsDto.fromEntities(ordersWithTickets);
  }

  @ApiOperation({ summary: 'Update the status of an order' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiBadRequestResponse({ description: 'Invalid data for updating order' })
  @ApiOkResponse({ description: 'Order status successfully updated' })
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
    try {
      const updatedOrder = await this.ordersService.updateOrderStatus({
        id: orderId,
        status: body.status,
      });
      return OrderDto.fromEntity(updatedOrder);
    } catch (error) {
      const errorMessage = await this.i18n.translate('orders.updateError');
      throw new BadRequestException(errorMessage);
    }
  }

  @Roles(Role.MANAGER)
  @Post('getUserOrders')
  async getUserOrders(@Body() user: Pick<User, 'email'>) {
    const ordersWithTickets = await this.ordersService.getAllUserOrders(user);
    return OrderWithTicketsDto.fromEntities(ordersWithTickets);
  }
}
