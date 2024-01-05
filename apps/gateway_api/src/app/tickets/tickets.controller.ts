import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Role, Ticket } from '@prisma/client';
import { Roles } from 'libs/security/decorators/roles.decorator';
import { TicketDto } from '../../domain/dtos/ticket.dto';
import { CreateTicketForm } from './domain/create-ticket.form';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Roles(Role.MANAGER, Role.USER)
  @Post()
  async createTicket(@Body() body: CreateTicketForm): Promise<TicketDto> {
    const form = CreateTicketForm.from(body);
    const errors = await CreateTicketForm.validate(form);

    if (errors) {
      throw new BadRequestException(errors);
    }

    const createdTicket = await this.ticketsService.createTicket(form);
    return TicketDto.fromEntity(createdTicket)!;
  }

  @Roles(Role.MANAGER, Role.USER)
  @Get(':id')
  async getTicketById(
    @Param('id') ticketId: string,
  ): Promise<TicketDto | null> {
    const ticket = await this.ticketsService.getTicketById(ticketId);
    return TicketDto.fromEntity(ticket);
  }

  @Roles(Role.MANAGER, Role.USER)
  @Get()
  async getAllTickets(): Promise<TicketDto[]> {
    const tickets = await this.ticketsService.getAllTickets();
    return TicketDto.fromEntities(tickets)!;
  }

  @Roles(Role.MANAGER, Role.USER)
  @Patch(':id')
  async updateTicket(
    @Param('id') ticketId: string,
    @Body() body: CreateTicketForm,
  ): Promise<TicketDto | null> {
    const form = CreateTicketForm.from(body);
    const errors = await CreateTicketForm.validate(form);

    if (errors) {
      throw new BadRequestException(errors);
    }

    const updatedTicket = await this.ticketsService.updateTicket(
      ticketId,
      form as Pick<Ticket, 'status' | 'price' | 'flightId' | 'orderId'>,
    );
    return TicketDto.fromEntity(updatedTicket)!;
  }

  @Roles(Role.MANAGER)
  @Delete(':id')
  async deleteTicket(@Param('id') ticketId: string): Promise<TicketDto | null> {
    const deletedTicket = await this.ticketsService.deleteTicket(ticketId);
    return TicketDto.fromEntity(deletedTicket)!;
  }
}
