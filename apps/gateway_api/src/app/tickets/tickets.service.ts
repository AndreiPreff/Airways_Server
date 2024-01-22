import { Injectable } from '@nestjs/common';
import { Direction, PrismaClient, Status, Ticket, User } from '@prisma/client';
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
  ): Promise<Ticket[]> {
    return this.prisma.$transaction(async (prisma: PrismaClient) => {
      const order = await this.ordersRepo.createOrder(
        { userId: user.id },
        prisma,
      );

      if (!order) {
        throw new Error('Order does not exist.');
      }

      const createdTickets: Ticket[] = [];
      const orderTotal: Ticket[] = [];

      for (const ticketData of tickets) {
        const flightIdsThere = ticketData.flightIdThere;
        const flightIdsBack = ticketData.flightIdBack || null;

        for (const flightIdThere of flightIdsThere) {
          const flightThere = await this.flightsRepo.getFlightById(
            { id: flightIdThere },
            prisma,
          );

          if (!flightThere || flightThere.available_tickets <= 0) {
            throw new Error(
              `No available tickets for flight ${flightThere.id}`,
            );
          }

          const ticket = await this.ticketsRepo.createTicket(
            {
              status: 'BOOKED',
              price: flightThere.price,
              flightId: flightThere.id,
              orderId: order.id,
              passengerName: ticketData.passengerName,
              passengerLastName: ticketData.passengerLastName,
              passengerPassportNumber: ticketData.passengerPassportNumber,
              direction: Direction.THERE,
            },
            prisma,
          );

          await this.flightsRepo.updateAvailableTickets(
            {
              id: flightThere.id,
              available_tickets: flightThere.available_tickets - 1,
            },
            prisma,
          );

          orderTotal.push(ticket);
          createdTickets.push(ticket);
        }

        if (flightIdsBack) {
          for (const flightIdBack of flightIdsBack) {
            const flightBack = await this.flightsRepo.getFlightById(
              { id: flightIdBack },
              prisma,
            );

            if (!flightBack || flightBack.available_tickets <= 0) {
              throw new Error(
                `No available tickets for flight ${flightBack.id}`,
              );
            }

            const ticket = await this.ticketsRepo.createTicket(
              {
                status: 'BOOKED',
                price: flightBack.price,
                flightId: flightBack.id,
                orderId: order.id,
                passengerName: ticketData.passengerName,
                passengerLastName: ticketData.passengerLastName,
                passengerPassportNumber: ticketData.passengerPassportNumber,
                direction: Direction.BACK,
              },
              prisma,
            );

            await this.flightsRepo.updateAvailableTickets(
              {
                id: flightBack.id,
                available_tickets: flightBack.available_tickets - 1,
              },
              prisma,
            );

            orderTotal.push(ticket);
            createdTickets.push(ticket);
          }
        }
      }

      const flattenedTickets = orderTotal.flat();
      const total = flattenedTickets.reduce(
        (acc, ticket) => acc + ticket.price,
        0,
      );

      await this.ordersRepo.updateOrder(
        { id: order.id, order_total: total },
        prisma,
      );

      return createdTickets;
    });
  }

  async getTicketById(ticket: Pick<Ticket, 'id'>): Promise<Ticket | null> {
    return await this.ticketsRepo.getTicketById({ id: ticket.id });
  }

  async updateTicket(
    ticket: Pick<Ticket, 'id' | 'status'>,
  ): Promise<Ticket | null> {
    return this.prisma.$transaction(async (prisma: PrismaClient) => {
      const updatedTicket = await this.ticketsRepo.updateTicket(
        { ...ticket },
        prisma,
      );
      if (ticket.status === ('CANCELLED' as Status)) {
        const existingTicket = await this.getTicketById(ticket);
        await this.ordersRepo.updateOrder(
          { id: existingTicket.orderId, order_total: -existingTicket.price },
          prisma,
        );
        const existingFlight = await this.flightsRepo.getFlightById(
          { id: existingTicket.flightId },
          prisma,
        );
        await this.flightsRepo.updateAvailableTickets(
          {
            id: existingFlight.id,
            available_tickets: existingFlight.available_tickets + 1,
          },
          prisma,
        );
      }
      return updatedTicket;
    });
  }

  async deleteTicket(ticket: Pick<Ticket, 'id'>): Promise<Ticket | null> {
    return await this.ticketsRepo.deleteTicket(ticket);
  }
}
