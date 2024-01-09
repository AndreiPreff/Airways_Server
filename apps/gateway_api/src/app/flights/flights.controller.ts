import { Body, Controller, Post } from '@nestjs/common';
import { Public } from 'libs/security/decorators/public.decorator';
import { FindTicketsForm } from './domain/find-tickets.form';
import { FlightsService } from './flights.service';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Public()
  @Post('/available-tickets')
  async getAvailableTickets(@Body() formData: FindTicketsForm) {
    try {
      const availableTickets =
        await this.flightsService.findAvailableTickets(formData);
      return { success: true, data: availableTickets };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Public()
  @Post('/available-tickets-sorted-by-price')
  async getAvailableTicketsSortedByPrice(@Body() formData: FindTicketsForm) {
    try {
      const availableTickets =
        await this.flightsService.findAvailableTicketsSortedByPrice(formData);
      return { success: true, data: availableTickets };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Public()
  @Post('/available-tickets-sorted-by-time')
  async getAvailableTicketsSortedByTime(@Body() formData: FindTicketsForm) {
    try {
      const availableTickets =
        await this.flightsService.findAvailableTicketsSortedByTime(formData);
      return { success: true, data: availableTickets };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
