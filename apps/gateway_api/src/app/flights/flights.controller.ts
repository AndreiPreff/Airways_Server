import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { Flight } from '@prisma/client';
import { Public } from 'libs/security/decorators/public.decorator';
import { FindTicketsForm } from './domain/find-tickets.form';
import { FlightsService } from './flights.service';
import { I18nService } from 'nestjs-i18n';

@Controller('flights')
export class FlightsController {
  constructor(
    private readonly flightsService: FlightsService,
    private readonly i18n: I18nService,) {}

  @Public()
  @Post('/available-tickets')
  async getAvailableTickets(@Body() formData: FindTicketsForm) {
    const form = FindTicketsForm.from(formData);
    const errors = await FindTicketsForm.validate(form);
    if (errors) {
      const errorMessage = await this.i18n.translate('flights.validationError');
      throw new BadRequestException(errorMessage);
    }
    try {
      const availableTickets =
        await this.flightsService.findAvailableTickets(form);
      return { success: true, data: availableTickets };
    } catch (error) {
      const errorMessage = await this.i18n.translate('flights.processingError');
      return { success: false, error: errorMessage };
    }
  }

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
