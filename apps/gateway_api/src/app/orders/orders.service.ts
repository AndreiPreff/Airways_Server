import { Injectable } from '@nestjs/common';
import { Order, Status, Ticket, User } from '@prisma/client';
import { Pick } from '@prisma/client/runtime/library';
import { PrismaService } from 'libs/prisma/prisma.service';
import { FlightsRepo } from '../../domain/repos/flights.repo';
import { OrdersRepo } from '../../domain/repos/orders.repo';
import { TicketsRepo } from '../../domain/repos/tickets.repo';
import { UsersRepo } from '../../domain/repos/users.repo';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepo: OrdersRepo,
    private readonly ticketsRepo: TicketsRepo,
    private readonly flightsRepo: FlightsRepo,
    private readonly usersRepo: UsersRepo,
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

  async getAllOrders(
    order: Pick<Order, 'userId'>,
  ): Promise<{ order: Order; tickets: Ticket[] }[]> {
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
  async getBookedOrders(
    data: Pick<Order, 'userId'>,
  ): Promise<{ order: Order; tickets: Ticket[] }[]> {
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

  async getAllUserOrders(data: Pick<User, 'email'>) {
    const user = await this.usersRepo.findByEmail({ email: data.email });
    const orders = await this.ordersRepo.getAllUserOrders({ userId: user.id });
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
    return this.prisma.$transaction(async (prisma: PrismaService) => {
      const updatedOrder = await this.ordersRepo.updateOrderStatus(
        order,
        prisma,
      );

      const tickets = await this.ticketsRepo.getAllOrderTickets({
        orderId: order.id,
      });

      for (const ticket of tickets) {
        if (ticket.status !== ('CANCELLED' as Status)) {
          await this.ticketsRepo.updateTicket(
            {
              id: ticket.id,
              status: order.status,
            },
            prisma,
          );
          const flight = await this.flightsRepo.getFlightById(
            {
              id: ticket.flightId,
            },
            prisma,
          );
          await this.flightsRepo.updateAvailableTickets(
            {
              id: flight.id,
              available_tickets: flight.available_tickets + 1,
            },
            prisma,
          );
        }
      }
      return updatedOrder;
    });
  }
}
