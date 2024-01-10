import { Body, Controller, Post } from '@nestjs/common';
import { Flight } from '@prisma/client';
import { Public } from 'libs/security/decorators/public.decorator';
import { FindTicketsForm } from './domain/find-tickets.form';
import { FlightsService } from './flights.service';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  private cachedRoutes: { there: Flight[][]; back: Flight[][] } = {
    there: [],
    back: [],
  };

  @Public()
  @Post('/available-tickets')
  async getAvailableTickets(@Body() formData: FindTicketsForm) {
    try {
      const availableTickets =
        await this.flightsService.findAvailableTickets(formData);
      this.cachedRoutes = availableTickets;
      return { success: true, data: availableTickets };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Public()
  @Post('/sort-by-price')
  async getAvailableTicketsSortedByPrice() {
    try {
      const sortedRoutes =
        await this.flightsService.findAvailableTicketsSortedByPrice(
          this.cachedRoutes,
        );
      return { success: true, data: sortedRoutes };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Public()
  @Post('/sort-by-time')
  async getAvailableTicketsSortedByTime() {
    try {
      const sortedRoutes =
        await this.flightsService.findAvailableTicketsSortedByTime(
          this.cachedRoutes,
        );
      return { success: true, data: sortedRoutes };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
