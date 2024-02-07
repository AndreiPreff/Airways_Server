import { Injectable } from '@nestjs/common';
import { PrismaClient, Ticket } from '@prisma/client';
import { PrismaService } from 'libs/prisma/prisma.service';

@Injectable()
export class TicketsRepo {
  constructor(private readonly prisma: PrismaService) {}

  async createTicket(
    ticketData: Pick<
      Ticket,
      | 'status'
      | 'price'
      | 'flightId'
      | 'orderId'
      | 'passengerName'
      | 'passengerLastName'
      | 'passengerPassportNumber'
      | 'direction'
    >,
    prisma?: PrismaClient,
  ): Promise<Ticket> {
    return await (prisma || this.prisma).ticket.create({
      data: ticketData,
    });
  }

  async getTicketById(ticketId: Pick<Ticket, 'id'>): Promise<Ticket> {
    return await this.prisma.ticket.findUnique({
      where: { id: ticketId.id },
    });
  }

  async getAllOrderTickets(order: Pick<Ticket, 'orderId'>): Promise<Ticket[]> {
    return await this.prisma.ticket.findMany({
      where: {
        orderId: order.orderId,
      },
      include: {
        flight: true,
      },
    });
  }

  async updateTicket(
    ticketData: Pick<Ticket, 'status' | 'id'>,
    prisma?: PrismaClient,
  ): Promise<Ticket> {
    return await (prisma || this.prisma).ticket.update({
      where: { id: ticketData.id },
      data: ticketData,
      include: {
        flight: true,
      },
    });
  }

  async deleteTicket(ticket: Pick<Ticket, 'id'>): Promise<Ticket> {
    return await this.prisma.ticket.delete({
      where: { id: ticket.id },
    });
  }
}
