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
import { CurrentUser } from 'libs/security/decorators/current-user.decorator';
import { Roles } from 'libs/security/decorators/roles.decorator';
import { TicketDto } from '../../domain/dtos/ticket.dto';
import { UserSessionDto } from '../../domain/dtos/user-session.dto';
import { CreateTicketForm } from './domain/create-ticket.form';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Roles(Role.MANAGER, Role.USER)
  @Post()
  async createTicket(
    @Body() body: CreateTicketForm | CreateTicketForm[],
    @CurrentUser() currentUser: UserSessionDto,
  ): Promise<TicketDto | TicketDto[]> {
    const forms = Array.isArray(body)
      ? body.map(CreateTicketForm.from)
      : [CreateTicketForm.from(body)];

    const errors = await Promise.all(
      forms.map((form) => CreateTicketForm.validate(form)),
    );

    const hasErrors = errors.some((error) => error !== false);

    if (hasErrors) {
      throw new BadRequestException(errors.filter((error) => error !== false));
    }

    const createdTickets = await this.ticketsService.createTicketWithOrder(
      forms,
      currentUser.sub,
    );

    return Array.isArray(body)
      ? createdTickets.map((ticket) => TicketDto.fromEntity(ticket)!)
      : TicketDto.fromEntity(createdTickets[0])!;
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
  @Patch(':id')
  async updateTicket(
    @Param('id') ticketId: string,
    @Body() body: CreateTicketForm,
  ): Promise<TicketDto | null> {
    const form = CreateTicketForm.from(body);
    const errors = CreateTicketForm.validate(form);

    if (errors) {
      throw new BadRequestException(errors);
    }

    const updatedTicket = await this.ticketsService.updateTicket(
      ticketId,
      form as Pick<Ticket, 'status'>,
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
