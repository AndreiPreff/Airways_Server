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
import { Role } from '@prisma/client';
import { CurrentUser } from 'libs/security/decorators/current-user.decorator';
import { Roles } from 'libs/security/decorators/roles.decorator';
import { TicketDto } from '../../domain/dtos/ticket.dto';
import { UserSessionDto } from '../../domain/dtos/user-session.dto';
import { CreateTicketForm } from './domain/create-ticket.form';
import { UpdateTicketForm } from './domain/update-ticket.form';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Roles(Role.MANAGER, Role.USER)
  @Post()
  async createTicket(
    @Body() body: CreateTicketForm[],
    @CurrentUser() currentUser: UserSessionDto,
  ): Promise<any> {
    const forms = body.map((ticketData) => CreateTicketForm.from(ticketData));

    const errors = await Promise.all(
      forms.map((form) => CreateTicketForm.validate(form)),
    );

    const hasErrors = errors.some((error) => error !== false);

    if (hasErrors) {
      throw new BadRequestException(errors.filter((error) => error !== false));
    }

    try {
      const createdTickets = await this.ticketsService.createTicketWithOrder(
        forms,
        { id: currentUser.sub },
      );
      const groupedTickets = this.ticketsService.groupTickets(createdTickets);
      return groupedTickets;
    } catch (error) {
      console.error('Error creating tickets:', error);
    }
  }

  @Roles(Role.MANAGER, Role.USER)
  @Get(':id')
  async getTicketById(
    @Param('id') ticketId: string,
  ): Promise<TicketDto | null> {
    const ticket = await this.ticketsService.getTicketById({ id: ticketId });
    return TicketDto.fromEntity(ticket);
  }

  @Roles(Role.MANAGER, Role.USER)
  @Patch(':id')
  async updateTicket(
    @Param('id') ticketId: string,
    @Body() body: UpdateTicketForm,
  ): Promise<TicketDto | null> {
    const form = UpdateTicketForm.from(body);
    const errors = UpdateTicketForm.validate(form);

    if (errors) {
      throw new BadRequestException(errors);
    }

    const updatedTicket = await this.ticketsService.updateTicket({
      id: ticketId,
      status: form.status,
    });
    return TicketDto.fromEntity(updatedTicket)!;
  }

  @Roles(Role.MANAGER)
  @Delete(':id')
  async deleteTicket(@Param('id') ticketId: string): Promise<TicketDto | null> {
    const deletedTicket = await this.ticketsService.deleteTicket({
      id: ticketId,
    });
    return TicketDto.fromEntity(deletedTicket)!;
  }
}
