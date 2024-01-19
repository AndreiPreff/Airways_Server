import { Flight, Ticket } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class TicketInfoDto {
  @ApiProperty({ description: 'ID of the ticket', example: 'a0b1c2d3-e4f5-6789-g0h1-i2j3k4l5m6n7' })
  id: string;

  @ApiProperty({ description: 'Date and time when the ticket was created', example: '2023-01-19T14:30:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Date and time when the ticket was last updated', example: '2023-01-19T15:45:00Z' })
  updatedAt: Date;

  @ApiProperty({ description: 'Status of the ticket', example: 'PAID' })
  status: string;

  @ApiProperty({ description: 'Price of the ticket', example: 150.00 })
  price: number;

  @ApiProperty({ description: 'Passenger\'s name', example: 'John' })
  passengerName: string;

  @ApiProperty({ description: 'Passenger\'s last name', example: 'Doe' })
  passengerLastName: string;

  @ApiProperty({ description: 'Passenger\'s passport number', example: 'AB123456' })
  passengerPassportNumber: string;

  @ApiProperty({ description: 'Direction of the flight', example: 'BACK' })
  direction: string;

  @ApiProperty({ description: 'ID of the flight associated with the ticket', example: 'a0b1c2d3-e4f5-6789-g0h1-i2j3k4l5m6n7' })
  flightId: string;

  @ApiProperty({ description: 'ID of the order associated with the ticket', example: 'a0b1c2d3-e4f5-6789-g0h1-i2j3k4l5m6n7' })
  orderId: string;

  @ApiProperty({
    description: 'Information about the flight associated with the ticket',
    })
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
}
