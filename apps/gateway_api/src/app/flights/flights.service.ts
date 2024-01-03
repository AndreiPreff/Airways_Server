// flight-search.service.ts
import { Injectable } from '@nestjs/common';
import { Flight } from '@prisma/client';
import { FlightsRepo } from '../../domain/repos/flights.repo';
import { FindTicketsForm } from './domain/find-tickets.form';

@Injectable()
export class FlightsService {
  constructor(private readonly flightsRepo: FlightsRepo) {}

  async findAvailableTickets(formData: FindTicketsForm): Promise<Flight[]> {
    const { from, to, departureDate, maxStops } = formData;

    // Получаем рейсы из базы данных, соответствующие заданным параметрам
    const flightsThere = await this.flightsRepo.getAllFlights(departureDate);

    // Получаем рейсы из базы данных, соответствующие заданным параметрам
    // const flightsBack = await this.flightsRepo.getAllFlights(returnDate);

    // Применяем алгоритм поиска оптимального маршрута
    const optimalRoute = this.findOptimalRoute(
      flightsThere,
      from,
      to,
      maxStops,
      departureDate,
    );
    // const returnOptimalRoute = returnDate
    //   ? this.findOptimalRoute(flightsThere, to, from, maxStops, returnDate)
    //   : [];

    // Генерируем билеты на основе найденного маршрута
    // const tickets = this.generateTickets(optimalRoute);

    return optimalRoute;
  }

  private findOptimalRoute(
    flights: Flight[],
    from: string,
    to: string,
    maxStops: number,
    date: Date,
  ): Flight[] {
    const graph = this.buildGraph(flights);
    const optimalRoute = this.dijkstra(graph, from, to, maxStops, date);
    return optimalRoute;
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

  private dijkstra(
    graph: Record<string, Flight[]>,
    start: string,
    end: string,
    maxStops: number,
    date: Date,
  ): Flight[] {
    const distances: Record<string, { distance: number; flights: Flight[] }> =
      {};
    const previous: Record<string, Flight | null> = {};
    const queue: string[] = Object.keys(graph);

    queue.forEach((city) => {
      distances[city] = {
        distance: city === start ? 0 : Infinity,
        flights: [],
      };
      previous[city] = null;
    });

    while (queue.length > 0) {
      const currentCity = this.getMinDistanceCity(queue, distances);
      queue.splice(queue.indexOf(currentCity), 1);

      if (currentCity === end) {
        break;
      }

      if (graph[currentCity]) {
        graph[currentCity].forEach((flight) => {
          // Условие фильтрации рейсов по дате и максимальному количеству пересадок
          const isFlightValid =
            flight.departure_time >= date &&
            distances[currentCity].flights.length <= maxStops;

          if (isFlightValid) {
            const potentialDistance =
              distances[currentCity].distance + flight.price;

            if (potentialDistance < distances[flight.to].distance) {
              distances[flight.to] = {
                distance: potentialDistance,
                flights: [...distances[currentCity].flights, flight],
              };
              previous[flight.to] = flight;
            }
          }
        });
      }
    }

    return this.reconstructPath(previous, end).flatMap(
      (city) => distances[city].flights,
    );
  }

  // private generateTickets(route: Flight[], returnRoute: Flight[]): Flight[] {
  //   const tickets: Flight[] = [];

  //   for (let i = 0; i < route.length; i++) {
  //     const currentFlight = route[i];

  //     // Создаем билет для полета в одну сторону
  //     const oneWayTicket: Flight = {
  //       id: `ticket_${i}_oneway`,
  //       // Другие свойства билета, например, status, price, flightId и т.д.
  //     };

  //     tickets.push(oneWayTicket);

  //     // Если не последний полет в маршруте, создаем билет для возвращения
  //     if (i < route.length - 1) {
  //       const returnFlight = route[i + 1];

  //       // Создаем билет для возвращения
  //       const returnTicket: Flight = {
  //         id: `ticket_${i}_return`,
  //         // Другие свойства билета для возвращения
  //       };

  //       tickets.push(returnTicket);

  //       // Если есть следующий полет после возвращения, создаем билет для следующего перелета
  //       if (i < route.length - 2) {
  //         const nextFlight = route[i + 2];

  //         // Создаем билет для следующего перелета
  //         const nextTicket: Flight = {
  //           id: `ticket_${i}_next`,
  //           // Другие свойства билета для следующего перелета
  //         };

  //         tickets.push(nextTicket);
  //       }
  //     }
  //   }

  //   // Генерируем билеты для обратного маршрута
  //   for (let i = 0; i < returnRoute.length; i++) {
  //     const currentReturnFlight = returnRoute[i];

  //     // Создаем билет для полета в обратную сторону
  //     const returnOneWayTicket: Flight = {
  //       id: `ticket_${i}_return_oneway`,
  //       // Другие свойства билета для обратного полета
  //     };

  //     tickets.push(returnOneWayTicket);

  //     // Если не последний полет в обратном маршруте, создаем билет для обратного возвращения
  //     if (i < returnRoute.length - 1) {
  //       const nextReturnFlight = returnRoute[i + 1];

  //       // Создаем билет для обратного возвращения
  //       const returnReturnTicket: Flight = {
  //         id: `ticket_${i}_return_return`,
  //         // Другие свойства билета для обратного возвращения
  //       };

  //       tickets.push(returnReturnTicket);

  //       // Если есть следующий полет после обратного возвращения, создаем билет для следующего перелета
  //       if (i < returnRoute.length - 2) {
  //         const nextReturnNextFlight = returnRoute[i + 2];

  //         // Создаем билет для следующего перелета обратно
  //         const returnNextTicket: Flight = {
  //           id: `ticket_${i}_return_next`,
  //           // Другие свойства билета для следующего перелета обратно
  //         };

  //         tickets.push(returnNextTicket);
  //       }
  //     }
  //   }

  //   return tickets;
  // }

  private getMinDistanceCity(
    queue: string[],
    distances: Record<string, { distance: number; flights: Flight[] }>,
  ): string {
    // Вернуть город с наименьшим расстоянием
    let minDistance = Infinity;
    let minDistanceCity = '';

    queue.forEach((city) => {
      if (distances[city].distance < minDistance) {
        minDistance = distances[city].distance;
        minDistanceCity = city;
      }
    });

    return minDistanceCity;
  }

  private reconstructPath(
    previous: Record<string, Flight | null>,
    end: string,
  ): string[] {
    // Восстановление пути от конечного города к начальному
    const path: string[] = [];
    let currentCity = end;

    while (previous[currentCity]) {
      path.unshift(currentCity);
      currentCity = previous[currentCity]?.from || '';
    }

    path.unshift(currentCity); // Добавить начальный город

    return path;
  }
}
