import { Injectable } from '@nestjs/common';
import { Flight } from '@prisma/client';
import { FlightsRepo } from '../../domain/repos/flights.repo';
import { FindTicketsForm } from './domain/find-tickets.form';

@Injectable()
export class FlightsService {
  constructor(private readonly flightsRepo: FlightsRepo) {}

  async findAvailableTicketsSortedByPrice(
    formData: FindTicketsForm,
  ): Promise<any> {
    const tickets = await this.findAvailableTickets(formData);

    const sortedThereRoutes = this.sortRoutesByTotalPrice(tickets.thereRoutes);
    const sortedBackRoutes = this.sortRoutesByTotalPrice(tickets.backRoutes);

    return { there: sortedThereRoutes, back: sortedBackRoutes };
  }

  async findAvailableTicketsSortedByTime(
    formData: FindTicketsForm,
  ): Promise<any> {
    const tickets = await this.findAvailableTickets(formData);

    const sortedThereRoutes = this.sortRoutesByTotalTime(tickets.thereRoutes);
    const sortedBackRoutes = this.sortRoutesByTotalTime(tickets.backRoutes);

    return { there: sortedThereRoutes, back: sortedBackRoutes };
  }

  async findAvailableTickets(formData: FindTicketsForm): Promise<any> {
    const { from, to, departureDate, maxStops, returnDate, ticketsAmount } =
      formData;

    const flightsThere = await this.flightsRepo.getAllFlights(
      departureDate,
      ticketsAmount,
    );
    const thereRoutes = this.findRoutes(flightsThere, from, to, maxStops);

    const flightsBack = returnDate
      ? await this.flightsRepo.getAllFlights(returnDate, ticketsAmount)
      : [];

    const backRoutes = returnDate
      ? this.findRoutes(flightsBack, to, from, maxStops)
      : [];

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
        const visitedTo = path.some(
          (visitedFlight) => visitedFlight.to === flight.to,
        );
        const visitedFrom = path.some(
          (visitedFlight) => visitedFlight.from === flight.from,
        );

        if (!visitedTo && !visitedFrom) {
          const newPath = [...path, flight];

          if (
            flight.to === to &&
            this.isFlightConnectionValid(path[path.length - 1], flight, path)
          ) {
            routes.push(newPath);
          }

          if (newPath.length <= maxStops) {
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
    path: Flight[],
  ): boolean {
    const arrivalTime = arrivalFlight?.arrival_time
      ? new Date(arrivalFlight.arrival_time).getTime()
      : 0;
    const departureTime = new Date(departureFlight.departure_time).getTime();

    const minConnectionInterval = 10 * 60 * 1000;

    if (departureTime - arrivalTime < minConnectionInterval) {
      return false;
    }

    for (let i = 0; i < path.length - 1; i++) {
      const currentArrivalTime = new Date(path[i].arrival_time).getTime();
      const nextDepartureTime = new Date(path[i + 1].departure_time).getTime();

      if (nextDepartureTime - currentArrivalTime < minConnectionInterval) {
        return false;
      }
    }

    return true;
  }

  private sortRoutesByTotalPrice(routes: Flight[][]): Flight[][] {
    return routes
      .map((route) => ({
        route,
        total_price: route.reduce((total, flight) => total + flight.price, 0),
      }))
      .sort((a, b) => a.total_price - b.total_price)
      .map((result) => result.route);
  }

  private sortRoutesByTotalTime(routes: Flight[][]): Flight[][] {
    return routes
      .map((route) => ({
        route,
        total_time: this.calculateTotalTime(route),
      }))
      .sort((a, b) => a.total_time - b.total_time)
      .map((result) => result.route);
  }

  private calculateTotalTime(route: Flight[]): number {
    if (route.length === 0) {
      return 0;
    }

    const firstDepartureTime = new Date(route[0].departure_time).getTime();
    const lastArrivalTime = new Date(
      route[route.length - 1].arrival_time,
    ).getTime();

    return lastArrivalTime - firstDepartureTime;
  }
}
