import { Injectable } from '@nestjs/common';
import { Ticket } from '@prisma/client';
import { TicketsRepo } from '../../domain/repos/tickets.repo';

@Injectable()
export class TicketsService {
  constructor(private readonly ticketsRepo: TicketsRepo) {}

  async createTicket(
    ticketData: Pick<
      Ticket,
      'status' | 'price' | 'flightId' | 'orderId' | 'amount'
    >,
  ): Promise<Ticket> {
    return await this.ticketsRepo.createTicket(ticketData);
  }

  async getTicketById(ticketId: string): Promise<Ticket | null> {
    return await this.ticketsRepo.getTicketById({ id: ticketId });
  }

  async getAllTickets(): Promise<Ticket[]> {
    return await this.ticketsRepo.getAllTickets();
  }

  async updateTicket(
    ticketId: string,
    ticketData: Pick<Ticket, 'status' | 'price' | 'flightId' | 'orderId'>,
  ): Promise<Ticket | null> {
    return await this.ticketsRepo.updateTicket({
      ...ticketData,
      id: ticketId,
    });
  }

  async deleteTicket(ticketId: string): Promise<Ticket | null> {
    return await this.ticketsRepo.deleteTicket(ticketId);
  }
}
