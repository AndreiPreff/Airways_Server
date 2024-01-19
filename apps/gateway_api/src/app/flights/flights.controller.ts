import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { Flight } from '@prisma/client';
import { Public } from 'libs/security/decorators/public.decorator';
import { FindTicketsForm } from './domain/find-tickets.form';
import { FlightsService } from './flights.service';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('flights')
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @ApiOperation({ summary: 'Get available tickets' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiOkResponse({ description: 'List of available tickets' })
  @Public()
  @Post('/available-tickets')
  async getAvailableTickets(@Body() formData: FindTicketsForm) {
    const form = FindTicketsForm.from(formData);
    const errors = await FindTicketsForm.validate(form);
    if (errors) {
      throw new BadRequestException();
    }
    try {
      const availableTickets =
        await this.flightsService.findAvailableTickets(form);
      return { success: true, data: availableTickets };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @ApiOperation({ summary: 'Sort available tickets by price' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiOkResponse({ description: 'List of available tickets sorted by price' })
  @Public()
  @Post('/sort-by-price')
  async sortByPrice(@Body() routes: { there: Flight[][]; back: Flight[][] }) {
    try {
      const availableTickets =
        await this.flightsService.findAvailableTicketsSortedByPrice(routes);
      return { success: true, data: availableTickets };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @ApiOperation({ summary: 'Sort available tickets by time' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiOkResponse({ description: 'List of available tickets sorted by time' })
  @Public()
  @Post('/sort-by-time')
  async sortByTime(@Body() routes: { there: Flight[][]; back: Flight[][] }) {
    try {
      const availableTickets =
        await this.flightsService.findAvailableTicketsSortedByTime(routes);
      return { success: true, data: availableTickets };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
