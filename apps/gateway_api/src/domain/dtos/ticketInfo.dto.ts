import { Flight, Ticket } from '@prisma/client';

export class TicketInfoDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  price: number;
  passengerName: string;
  passengerLastName: string;
  passengerPassportNumber: string;
  direction: string;
  flightId: string;
  orderId: string;
  flight: {
    flight_number: string;
    from: string;
    to: string;
    departure_time: Date;
    arrival_time: Date;
    available_tickets: number;
  };

  constructor(ticket: Ticket, flight: Flight) {
    this.id = ticket.id;
    this.createdAt = ticket.createdAt;
    this.updatedAt = ticket.updatedAt;
    this.status = ticket.status;
    this.price = ticket.price;
    this.passengerName = ticket.passengerName;
    this.passengerLastName = ticket.passengerLastName;
    this.passengerPassportNumber = ticket.passengerPassportNumber;
    this.direction = ticket.direction;
    this.flightId = ticket.flightId;
    this.orderId = ticket.orderId;

    this.flight = {
      flight_number: flight.flight_number,
      from: flight.from,
      to: flight.to,
      departure_time: flight.departure_time,
      arrival_time: flight.arrival_time,
      available_tickets: flight.available_tickets,
    };
  }

  static fromEntity(entity?: any): TicketInfoDto | undefined {
    if (!entity || !entity.flight) {
      return undefined;
    }

    return new TicketInfoDto(
      {
        id: entity.id,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        status: entity.status,
        price: entity.price,
        passengerName: entity.passengerName,
        passengerLastName: entity.passengerLastName,
        passengerPassportNumber: entity.passengerPassportNumber,
        direction: entity.direction,
        flightId: entity.flightId,
        orderId: entity.orderId,
      },
      entity.flight,
    );
  }

  static fromEntities(entities?: any[]): TicketInfoDto[] | undefined {
    if (!entities?.map) {
      return undefined;
    }

    return entities.map((entity) => this.fromEntity(entity)!);
  }

  static groupTickets(
    tickets: TicketInfoDto[],
  ): Record<string, Record<string, TicketInfoDto[]>> {
    const grouped: Record<string, Record<string, TicketInfoDto[]>> = {};

    for (const ticket of tickets) {
      const passportNumber = ticket.passengerPassportNumber;

      const passportGroup = (grouped[passportNumber] =
        grouped[passportNumber] || {});

      const directionGroup = (passportGroup[ticket.direction] =
        passportGroup[ticket.direction] || []);

      directionGroup.push({ ...ticket, orderId: ticket.orderId });
    }

    return grouped;
  }
}
