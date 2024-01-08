import { Injectable } from '@nestjs/common';
import { Order, Status } from '@prisma/client';
import { TicketDto } from '../../domain/dtos/ticket.dto';
import { OrdersRepo } from '../../domain/repos/orders.repo';
import { TicketsRepo } from '../../domain/repos/tickets.repo';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepo: OrdersRepo,
    private readonly ticketsRepo: TicketsRepo,
  ) {}

  async createOrder(userId: Pick<Order, 'userId'>): Promise<Order> {
    return await this.ordersRepo.createOrder(userId);
  }

  async getAllOrderTickets(order: Pick<Order, 'id'>): Promise<TicketDto[]> {
    const tickets = await this.ticketsRepo.getAllOrderTickets({
      orderId: order.id,
    });
    return TicketDto.fromEntities(tickets) || [];
  }

  async updateOrderStatus(order: Pick<Order, 'id' | 'status'>) {
    const updatedOrder = await this.ordersRepo.updateOrderStatus(order);

    const tickets = await this.ticketsRepo.getAllOrderTickets({
      orderId: order.id,
    });

    for (const ticket of tickets) {
      if (ticket.status !== ('CANCELLED' as Status)) {
        await this.ticketsRepo.updateTicket({
          id: ticket.id,
          status: order.status,
        });
      }
    }
    return updatedOrder;
  }
}
