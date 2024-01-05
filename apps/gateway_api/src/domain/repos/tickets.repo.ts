import { Injectable } from '@nestjs/common';
import { Ticket } from '@prisma/client';
import { PrismaService } from 'libs/prisma/prisma.service';

@Injectable()
export class TicketsRepo {
  constructor(private readonly prisma: PrismaService) {}

  async createTicket(
    ticketData: Pick<
      Ticket,
      'status' | 'price' | 'flightId' | 'orderId' | 'amount'
    >,
  ): Promise<Ticket> {
    return await this.prisma.ticket.create({
      data: ticketData,
    });
  }

  async getTicketById(ticketId: Pick<Ticket, 'id'>): Promise<Ticket | null> {
    return await this.prisma.ticket.findUnique({
      where: { id: ticketId.id },
    });
  }

  async getAllTickets(): Promise<Ticket[]> {
    return await this.prisma.ticket.findMany();
  }

  async updateTicket(
    ticketData: Pick<Ticket, 'status' | 'price' | 'id'>,
  ): Promise<Ticket | null> {
    return await this.prisma.ticket.update({
      where: { id: ticketData.id },
      data: ticketData,
    });
  }

  async deleteTicket(ticketId: string): Promise<Ticket | null> {
    return await this.prisma.ticket.delete({
      where: { id: ticketId },
    });
  }
}
