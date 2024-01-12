import { Injectable } from '@nestjs/common';
import { Flight } from '@prisma/client';
import { PrismaService } from 'libs/prisma/prisma.service';

@Injectable()
export class FlightsRepo {
  constructor(private readonly prisma: PrismaService) {}

  async getAllFlights(
    flight: Pick<Flight, 'departure_time' | 'available_tickets'>,
  ): Promise<Flight[]> {
    const originalDate = new Date(flight.departure_time);
    const endOfDayDate = new Date(originalDate);
    endOfDayDate.setUTCHours(23, 59, 59, 999);
    const newDateFormattedString =
      endOfDayDate.toISOString().slice(0, -5) + 'Z';

    return await this.prisma.flight.findMany({
      where: {
        departure_time: {
          gte: flight.departure_time,
          lte: newDateFormattedString,
        },
        available_tickets: {
          gte: flight.available_tickets,
        },
      },
    });
  }

  async getFlightById(flight: Pick<Flight, 'id'>): Promise<Flight> {
    return await this.prisma.flight.findUnique({
      where: {
        id: flight.id,
      },
    });
  }

  async updateAvailableTickets(
    flight: Pick<Flight, 'id' | 'available_tickets'>,
  ): Promise<Flight> {
    return await this.prisma.flight.update({
      where: {
        id: flight.id,
      },
      data: { available_tickets: flight.available_tickets },
    });
  }
}
