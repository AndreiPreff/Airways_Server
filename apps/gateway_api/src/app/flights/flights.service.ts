import { Injectable } from '@nestjs/common';
import { Flight } from '@prisma/client';
import { FlightsRepo } from '../../domain/repos/flights.repo';
import { FindTicketsForm } from './domain/find-tickets.form';

@Injectable()
export class FlightsService {
  constructor(private readonly flightsRepo: FlightsRepo) {}

  async findAvailableTickets(formData: FindTicketsForm): Promise<Flight[]> {
    const { from, to, departureDate, maxStops, returnDate } = formData;

    // Получаем все рейсы из базы данных, которые происходят в эту дату из всех городов
    const flightsThere = await this.flightsRepo.getAllFlights(departureDate);
    // console.log('THERE', flightsThere);

    // Получаем все рейсы из базы данных, которые происходят в эту дату из всех городов
    const flightsBack = await this.flightsRepo.getAllFlights(returnDate);
    // console.log('BACK', flightsBack);

    // Применяем алгоритм поиска всех возсожных маршрутов
    const thereRoute = this.findOptimalRoute(flightsThere, from, to, maxStops);
    const backRoute = returnDate
      ? this.findOptimalRoute(flightsBack, to, from, maxStops)
      : [];
    console.log(thereRoute);
    console.log(backRoute);
    // Генерируем билеты на основе найденного маршрута

    return thereRoute; //билеты туда и билеты обратно ( пока нет модуля с билетами - вернем просто маршруты)
  }
  //тут мы ищем оптимальный маршрут ( строим граф и ...)
  private findOptimalRoute(
    flights: Flight[],
    from: string,
    to: string,
    maxStops: number,
  ): Flight[] {
    const graph = this.buildGraph(flights);
    //тут должен быть алгоритм поиска в ширину по графу, который вернет все возможные
  }

  //тут строится граф - это массив всех полетов для каждого города в эту дату
  private buildGraph(flights: Flight[]): Record<string, Flight[]> {
    const graph: Record<string, Flight[]> = {};

    flights.forEach((flight) => {
      if (!graph[flight.from]) {
        graph[flight.from] = [];
      }

      graph[flight.from].push(flight);
    });
    console.log('Graph:', graph);
    return graph;
  }
}
