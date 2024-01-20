import { Direction, Status, Ticket } from '@prisma/client';
import { IsEnum, IsNumber, IsString, IsUUID } from 'class-validator';
import { UUIDDto } from './uuid.dto';

export class TicketDto extends UUIDDto {
  status: Status;

  @IsNumber()
  price: number;

  @IsUUID()
  flightId: string;

  @IsUUID()
  orderId: string;

  @IsEnum(Direction)
  direction: string;

  @IsString()
  passengerName: string;

  @IsString()
  passengerLastName: string;

  @IsString()
  passengerPassportNumber: string;

  static fromEntity(entity?: Ticket): TicketDto | undefined {
    if (!entity) {
      return undefined;
    }

    const dto = new TicketDto();
    dto.id = entity.id;
    dto.createdAt = entity.createdAt.valueOf();
    dto.updatedAt = entity.updatedAt.valueOf();
    dto.status = entity.status;
    dto.price = entity.price;
    dto.passengerName = entity.passengerName;
    dto.passengerLastName = entity.passengerLastName;
    dto.passengerPassportNumber = entity.passengerPassportNumber;
    dto.flightId = entity.flightId;
    dto.orderId = entity.orderId;

    return dto;
  }

  static fromEntities(entities?: Ticket[]): TicketDto[] | undefined {
    if (!entities?.map) {
      return undefined;
    }
    return entities.map((entity) => this.fromEntity(entity)!);
  }

  static groupTickets(
    tickets: Ticket[],
  ): Record<string, Record<string, Ticket[]>> {
    const grouped: Record<string, Record<string, Ticket[]>> = {};

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
