import { Injectable } from '@nestjs/common';
import { Flight } from '@prisma/client';
import { PrismaService } from 'libs/prisma/prisma.service';

@Injectable()
export class FlightsRepo {
  constructor(private readonly prisma: PrismaService) {}

  // async findAvailableTickets(formData: FindTicketsForm) {
  //   // Здесь вы можете использовать Prisma для выполнения запросов к базе данных
  //   // Например, prisma.flight.findMany({ where: { ваше_условие_поиска } })
  //   // Затем обработайте результат и верните его
  //   return [];
  // }

  async getAllFlights(date: Date): Promise<Flight[]> {
    return this.prisma.flight.findMany({
      where: {
        departure_time: {
          gte: date,
        },
      },
    });
  }
}
