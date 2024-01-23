import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { Flight } from '@prisma/client';
import { Public } from 'libs/security/decorators/public.decorator';
import { FindTicketsForm } from './domain/find-tickets.form';
import { FlightsService } from './flights.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('flights')
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @ApiOperation({ summary: 'Get available tickets' })
  @ApiBadRequestResponse({
    description: 'Bad request',
    schema: {
      example: {
        message: ['maxStops must not be less than 0'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'List of available tickets',
    schema: {
      example: {
        message: {
          success: true,
          data: {
            there: [
              [
                {
                  id: 'da84d67b-360b-446d-8170-d683bdb58384',
                  createdAt: '2024-01-23T09:38:32.979Z',
                  updatedAt: '2024-01-23T09:38:32.979Z',
                  flight_number: 'MID01',
                  from: 'Minsk',
                  to: 'Madrid',
                  departure_time: '2024-01-25T15:05:00.000Z',
                  arrival_time: '2024-01-25T19:20:00.000Z',
                  price: 450,
                  available_tickets: 160,
                },
              ],
            ],
            back: [
              [
                {
                  id: '023bc336-eb54-4d87-b7e7-0af9f81b159d',
                  createdAt: '2024-01-23T09:38:33.758Z',
                  updatedAt: '2024-01-23T09:38:33.758Z',
                  flight_number: 'MID01R',
                  from: 'Madrid',
                  to: 'Minsk',
                  departure_time: '2024-01-27T19:25:00.000Z',
                  arrival_time: '2024-01-27T23:40:00.000Z',
                  price: 450,
                  available_tickets: 160,
                },
              ],
            ],
          },
        },
      },
    },
  })
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
