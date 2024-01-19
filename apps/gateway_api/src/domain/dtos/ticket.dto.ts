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
}
