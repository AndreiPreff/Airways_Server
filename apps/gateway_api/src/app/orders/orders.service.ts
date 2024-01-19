import { Injectable } from '@nestjs/common';
import { Order, Status, Ticket } from '@prisma/client';
import { PrismaService } from 'libs/prisma/prisma.service';
import { FlightsRepo } from '../../domain/repos/flights.repo';
import { OrdersRepo } from '../../domain/repos/orders.repo';
import { TicketsRepo } from '../../domain/repos/tickets.repo';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepo: OrdersRepo,
    private readonly ticketsRepo: TicketsRepo,
    private readonly flightsRepo: FlightsRepo,
    private readonly prisma: PrismaService,
  ) {}

  async createOrder(userId: Pick<Order, 'userId'>): Promise<Order> {
    return await this.ordersRepo.createOrder(userId);
  }

  async getAllOrderTickets(order: Pick<Order, 'id'>): Promise<Ticket[]> {
    const tickets = await this.ticketsRepo.getAllOrderTickets({
      orderId: order.id,
    });
    return tickets;
  }

  async getAllOrders(order: Pick<Order, 'userId'>) {
    const orders = await this.ordersRepo.getAllOrders(order);
    const ordersWithTickets = [];

    for (const order of orders) {
      const tickets = await this.getAllOrderTickets({ id: order.id });
      ordersWithTickets.push({
        order,
        tickets,
      });
    }

    return ordersWithTickets;
  }
  async getBookedOrders(data: Pick<Order, 'userId'>) {
    const orders = await this.ordersRepo.getOrdersById(data);

    const ordersWithTickets = [];

    for (const order of orders) {
      const tickets = await this.getAllOrderTickets({ id: order.id });
      ordersWithTickets.push({
        order,
        tickets,
      });
    }

    return ordersWithTickets;
  }

  async updateOrderStatus(order: Pick<Order, 'id' | 'status'>) {
    return this.prisma.$transaction(async () => {
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
          const flight = await this.flightsRepo.getFlightById({
            id: ticket.flightId,
          });
          await this.flightsRepo.updateAvailableTickets({
            id: flight.id,
            available_tickets: flight.available_tickets + 1,
          });
        }
      }
      return updatedOrder;
    });
  }
}
