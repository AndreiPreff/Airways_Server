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
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role, Ticket } from '@prisma/client';
import { CurrentUser } from 'libs/security/decorators/current-user.decorator';
import { Roles } from 'libs/security/decorators/roles.decorator';
import { TicketDto } from '../../domain/dtos/ticket.dto';
import { UserSessionDto } from '../../domain/dtos/user-session.dto';
import { CreateTicketForm } from './domain/create-ticket.form';
import { UpdateTicketForm } from './domain/update-ticket.form';
import { TicketsService } from './tickets.service';
import { I18nService } from 'nestjs-i18n';


@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly i18n: I18nService) {}

  @ApiOperation({ summary: 'Create ticket' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOkResponse({ description: 'Ticket successfully created' })
  @Roles(Role.MANAGER, Role.USER)
  @Post()
  async createTicket(
    @Body() body: CreateTicketForm[],
    @CurrentUser() currentUser: UserSessionDto,
  ): Promise<Record<string, Record<string, Ticket[]>>> {
    try {
    const forms = body.map((ticketData) => CreateTicketForm.from(ticketData));

    const errors = await Promise.all(
      forms.map((form) => CreateTicketForm.validate(form)),
    );

    const hasErrors = errors.some((error) => error !== false);

    if (hasErrors) {
      throw new BadRequestException(errors.filter((error) => error !== false));
    }


    const createdTickets = await this.ticketsService.createTicketWithOrder(
      forms,
      { id: currentUser.sub },
    );
    return TicketDto.groupTickets(createdTickets);
  } catch (error) {
    const errorMessage = await this.i18n.translate('tickets.createError');
    throw new BadRequestException(errorMessage);
  }
}

  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Ticket ID' })
  @ApiOkResponse({ description: 'Ticket found' })
  @Roles(Role.MANAGER, Role.USER)
  @Get(':id')
  async getTicketById(
    @Param('id') ticketId: string,
  ): Promise<TicketDto | null> {
    const ticket = await this.ticketsService.getTicketById({ id: ticketId });
    return TicketDto.fromEntity(ticket);
  }

  @ApiOperation({ summary: 'Update ticket' })
  @ApiParam({ name: 'id', type: 'string', description: 'Ticket ID' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOkResponse({ description: 'Ticket successfully updated' })
  @Roles(Role.MANAGER, Role.USER)
  @Patch(':id')
  async updateTicket(
    @Param('id') ticketId: string,
    @Body() body: UpdateTicketForm,
  ): Promise<TicketDto | null> {
    try {
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
  } catch (error) {
    const errorMessage = await this.i18n.translate('tickets.updateError');
    throw new BadRequestException(errorMessage);
  }
}

  @ApiOperation({ summary: 'Delete ticket' })
  @ApiParam({ name: 'id', type: 'string', description: 'Ticket ID' })
  @ApiOkResponse({ description: 'Ticket successfully deleted' })
  @Roles(Role.MANAGER)
  @Delete(':id')
  async deleteTicket(@Param('id') ticketId: string): Promise<TicketDto | null> {
    const deletedTicket = await this.ticketsService.deleteTicket({
      id: ticketId,
    });
    if (deletedTicket) {
      return null;
    }
  }
}
