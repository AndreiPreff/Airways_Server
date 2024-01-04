import { Injectable } from '@nestjs/common';
import { Flight } from '@prisma/client';
import { FlightsRepo } from '../../domain/repos/flights.repo';
import { FindTicketsForm } from './domain/find-tickets.form';

@Injectable()
export class FlightsService {
  constructor(private readonly flightsRepo: FlightsRepo) {}

  async findAvailableTickets(formData: FindTicketsForm): Promise<any> {
    const { from, to, departureDate, maxStops, returnDate } = formData;

    const flightsThere = await this.flightsRepo.getAllFlights(departureDate);
    const flightsBack = returnDate
      ? await this.flightsRepo.getAllFlights(returnDate)
      : [];

    const thereRoutes = this.findRoutes(flightsThere, from, to, maxStops);
    const backRoutes = returnDate
      ? this.findRoutes(flightsBack, to, from, maxStops)
      : [];

    console.log('Маршруты туда:', thereRoutes);
    console.log('Маршруты обратно:', backRoutes);

    // Теперь вы можете генерировать билеты на основе найденных маршрутов
    return { there: thereRoutes, back: backRoutes };
  }

  private findRoutes(
    flights: Flight[],
    from: string,
    to: string,
    maxStops: number,
  ): Flight[][] {
    const graph = this.buildGraph(flights);
    const queue: { city: string; path: Flight[] }[] = [];

    queue.push({ city: from, path: [] });

    const routes: Flight[][] = [];

    while (queue.length > 0) {
      const { city, path } = queue.shift();
      const availableFlights = graph[city] || [];

      for (const flight of availableFlights) {
        // Проверяем, что мы не посетили этот город ранее в текущем маршруте
        if (!path.some((visitedFlight) => visitedFlight.to === flight.to)) {
          const newPath = [...path, flight];

          if (
            flight.to === to &&
            this.isFlightConnectionValid(path[path.length - 1], flight)
          ) {
            // Достигнута конечная точка, добавляем маршрут в результат
            routes.push(newPath);
          }

          if (newPath.length <= maxStops) {
            // Добавляем соседний город в очередь
            queue.push({
              city: flight.to,
              path: newPath,
            });
          }
        }
      }
    }

    return routes;
  }

  private buildGraph(flights: Flight[]): Record<string, Flight[]> {
    const graph: Record<string, Flight[]> = {};

    flights.forEach((flight) => {
      if (!graph[flight.from]) {
        graph[flight.from] = [];
      }

      graph[flight.from].push(flight);
    });

    return graph;
  }

  private isFlightConnectionValid(
    arrivalFlight: Flight,
    departureFlight: Flight,
  ): boolean {
    const arrivalTime = arrivalFlight?.arrival_time
      ? new Date(arrivalFlight.arrival_time).getTime()
      : 0; // Установим 0, если arrival_time не определено
    const departureTime = new Date(departureFlight.departure_time).getTime();

    // Убедимся, что время между прилетом и вылетом не меньше 10 минут
    const minConnectionInterval = 10 * 60 * 1000; // 10 минут в миллисекундах

    return departureTime - arrivalTime >= minConnectionInterval;
  }
}
