import { Status, Ticket } from '@prisma/client';
import { IsEnum, IsNumber, IsUUID } from 'class-validator';
import { UUIDDto } from './uuid.dto';

export class TicketDto extends UUIDDto {
  @IsEnum(Status)
  status: Status;

  @IsNumber()
  price: number;

  @IsUUID()
  flightId: string;

  @IsUUID()
  orderId: string;

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
