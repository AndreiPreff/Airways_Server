import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Status, Ticket } from '@prisma/client';
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
  ) {}

  async createTicketWithOrder(
    tickets: CreateTicketForm[],
    userId: string,
  ): Promise<Ticket[]> {
    const order = await this.ordersRepo.createOrder({ userId });

    const createdTickets = await Promise.all(
      tickets.map(async (ticketData) => {
        const flight = await this.flightsRepo.getFlightById({
          id: ticketData.flightId,
        });

        if (!flight) {
          throw new NotFoundException(
            `Flight with id ${ticketData.flightId} not found`,
          );
        }

        try {
          const ticket = await this.ticketsRepo.createTicket({
            status: 'BOOKED',
            price: flight.price * ticketData.amount,
            flightId: flight.id,
            amount: ticketData.amount,
            orderId: order.id,
          });

          await this.flightsRepo.updateAvailableTickets({
            id: ticketData.flightId,
            available_tickets: flight.available_tickets - ticketData.amount,
          });

          return ticket;
        } catch (error) {
          throw new BadRequestException({
            statusCode: 400,
            error: 'Bad Request',
            message: [
              `Error creating ticket for flight ${ticketData.flightId}`,
            ],
          });
        }
      }),
    );

    const orderTotal = createdTickets.reduce(
      (total, ticket) => total + ticket.price,
      0,
    );

    await this.ordersRepo.updateOrder({
      id: order.id,
      order_total: orderTotal,
    });

    return createdTickets;
  }

  async getTicketById(ticketId: string): Promise<Ticket | null> {
    return await this.ticketsRepo.getTicketById({ id: ticketId });
  }

  async updateTicket(
    ticketId: string,
    ticketData: Pick<Ticket, 'status'>,
  ): Promise<Ticket | null> {
    const updatedTicket = await this.ticketsRepo.updateTicket({
      ...ticketData,
      id: ticketId,
    });
    if (ticketData.status === ('CANCELLED' as Status)) {
      const existingTicket = await this.getTicketById(ticketId);
      await this.ordersRepo.updateOrder({
        id: existingTicket.orderId,
        order_total: -existingTicket.price,
      });
      const existingFlight = await this.flightsRepo.getFlightById({
        id: existingTicket.flightId,
      });
      await this.flightsRepo.updateAvailableTickets({
        id: existingFlight.id,
        available_tickets:
          existingFlight.available_tickets + existingTicket.amount,
      });
    }

    return updatedTicket;
  }

  async deleteTicket(ticketId: string): Promise<Ticket | null> {
    return await this.ticketsRepo.deleteTicket(ticketId);
  }
}
