import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Status, Ticket } from '@prisma/client';
import { PrismaService } from 'libs/prisma/prisma.service';
import { FlightsRepo } from '../../domain/repos/flights.repo';
import { OrdersRepo } from '../../domain/repos/orders.repo';
import { TicketsRepo } from '../../domain/repos/tickets.repo';
import { CreateTicketForm } from './domain/create-ticket.form';

@Injectable()
export class TicketsService {
  constructor(
    private readonly ticketsRepo: TicketsRepo,
    private readonly ordersRepo: OrdersRepo,
    private readonly flightsRepo: FlightsRepo,
    private readonly prisma: PrismaService,
  ) {}

  async createTicketWithOrder(
    tickets: CreateTicketForm[],
    userId: string,
  ): Promise<Ticket[]> {
    return this.prisma.$transaction(async () => {
      const order = await this.ordersRepo.createOrder({ userId });

      const createdTickets: Ticket[] = [];

      for (const ticketData of tickets) {
        const flight = await this.flightsRepo.getFlightById({
          id: ticketData.flightId,
        });

        if (!flight) {
          throw new NotFoundException(
            `Flight with id ${ticketData.flightId} not found`,
          );
        }

        try {
          for (let i = 0; i < ticketData.amount; i++) {
            const ticket = await this.ticketsRepo.createTicket({
              status: 'BOOKED',
              price: flight.price,
              flightId: flight.id,
              orderId: order.id,
            });

            createdTickets.push(ticket);
          }

          await this.flightsRepo.updateAvailableTickets({
            id: ticketData.flightId,
            available_tickets: flight.available_tickets - ticketData.amount,
          });
        } catch (error) {
          throw new BadRequestException({
            statusCode: 400,
            error: 'Bad Request',
            message: [
              `Error creating ticket for flight ${ticketData.flightId}`,
            ],
          });
        }
      }

      const orderTotal = createdTickets.reduce(
        (total, ticket) => total + ticket.price,
        0,
      );

      await this.ordersRepo.updateOrder({
        id: order.id,
        order_total: orderTotal,
      });

      return createdTickets;
    });
  }

  async getTicketById(ticket: Pick<Ticket, 'id'>): Promise<Ticket | null> {
    return await this.ticketsRepo.getTicketById({ id: ticket.id });
  }

  async updateTicket(
    ticket: Pick<Ticket, 'id' | 'status'>,
  ): Promise<Ticket | null> {
    return this.prisma.$transaction(async () => {
      const updatedTicket = await this.ticketsRepo.updateTicket({
        ...ticket,
      });
      if (ticket.status === ('CANCELLED' as Status)) {
        const existingTicket = await this.getTicketById(ticket);
        await this.ordersRepo.updateOrder({
          id: existingTicket.orderId,
          order_total: -existingTicket.price,
        });
        const existingFlight = await this.flightsRepo.getFlightById({
          id: existingTicket.flightId,
        });
        await this.flightsRepo.updateAvailableTickets({
          id: existingFlight.id,
          available_tickets: existingFlight.available_tickets + 1,
        });
      }

      return updatedTicket;
    });
  }

  async deleteTicket(ticket: Pick<Ticket, 'id'>): Promise<Ticket | null> {
    return await this.ticketsRepo.deleteTicket(ticket);
  }
}
