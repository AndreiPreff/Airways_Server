import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Direction, Status, Ticket, User } from '@prisma/client';
import { Pick } from '@prisma/client/runtime/library';
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
    user: Pick<User, 'id'>,
  ): Promise<Record<string, Ticket[]>> {
    return this.prisma.$transaction(async () => {
      const createdTickets: Record<string, Ticket[]> = {};

      try {
        const order = await this.ordersRepo.createOrder({
          userId: user.id,
        });

        const orderTotal = await Promise.all(
          tickets.map(async (ticketData) => {
            const flightIdsThere = ticketData.flightIdThere;
            const flightIdsBack = ticketData.flightIdBack || [];

            const ticketsThere = await Promise.all(
              flightIdsThere.map(async (flightIdThere) => {
                const flightThere = await this.flightsRepo.getFlightById({
                  id: flightIdThere,
                });

                if (!flightThere) {
                  throw new NotFoundException(
                    `Flight with id ${flightIdThere} not found`,
                  );
                }

                try {
                  const ticket = await this.ticketsRepo.createTicket({
                    status: 'BOOKED',
                    price: flightThere.price,
                    flightId: flightThere.id,
                    orderId: order.id,
                    passengerName: ticketData.passengerName,
                    passengerLastName: ticketData.passengerLastName,
                    passengerPassportNumber: ticketData.passengerPassportNumber,
                    direction: Direction.THERE,
                  });

                  await this.flightsRepo.updateAvailableTickets({
                    id: flightThere.id,
                    available_tickets: flightThere.available_tickets - 1,
                  });

                  return ticket;
                } catch (error) {
                  throw new BadRequestException({
                    statusCode: 400,
                    error: 'Bad Request',
                    message: [
                      `Error creating ticket for flight ${flightThere.id}`,
                    ],
                  });
                }
              }),
            );

            const ticketsBack = await Promise.all(
              flightIdsBack.map(async (flightIdBack) => {
                const flightBack = await this.flightsRepo.getFlightById({
                  id: flightIdBack,
                });

                if (!flightBack) {
                  throw new NotFoundException(
                    `Flight with id ${flightIdBack} not found`,
                  );
                }

                try {
                  const ticket = await this.ticketsRepo.createTicket({
                    status: 'BOOKED',
                    price: flightBack.price,
                    flightId: flightBack.id,
                    orderId: order.id,
                    passengerName: ticketData.passengerName,
                    passengerLastName: ticketData.passengerLastName,
                    passengerPassportNumber: ticketData.passengerPassportNumber,
                    direction: Direction.BACK,
                  });

                  await this.flightsRepo.updateAvailableTickets({
                    id: flightBack.id,
                    available_tickets: flightBack.available_tickets - 1,
                  });

                  return ticket;
                } catch (error) {
                  throw new BadRequestException({
                    statusCode: 400,
                    error: 'Bad Request',
                    message: [
                      `Error creating ticket for flight ${flightBack.id}`,
                    ],
                  });
                }
              }),
            );

            const allTickets = [...ticketsThere, ...ticketsBack];
            createdTickets[ticketData.passengerPassportNumber] = allTickets;

            return allTickets;
          }),
        );

        const flattenedTickets = orderTotal.flat();
        const total = flattenedTickets.reduce(
          (acc, ticket) => acc + ticket.price,
          0,
        );

        await this.ordersRepo.updateOrder({
          id: order.id,
          order_total: total,
        });

        return createdTickets;
      } catch (error) {
        // Rollback the transaction in case of an error
        await this.prisma.$queryRaw`ROLLBACK;`;

        throw new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: ['Error creating tickets and order'],
        });
      }
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

  groupTickets(
    tickets: Record<string, Ticket[]>,
  ): Record<string, Record<string, Ticket[]>> {
    const grouped: Record<string, Record<string, Ticket[]>> = {};

    for (const passportNumber in tickets) {
      if (Object.prototype.hasOwnProperty.call(tickets, passportNumber)) {
        grouped[passportNumber] = {
          THERE: [],
          BACK: [],
        };

        for (const ticket of tickets[passportNumber]) {
          grouped[passportNumber][ticket.direction].push(ticket);
        }
      }
    }

    return grouped;
  }
}
