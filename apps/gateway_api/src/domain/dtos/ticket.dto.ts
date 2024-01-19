import { Direction, Status, Ticket } from '@prisma/client';
import { IsEnum, IsNumber, IsString, IsUUID } from 'class-validator';
import { UUIDDto } from './uuid.dto';
import { ApiProperty } from '@nestjs/swagger';

export class TicketDto extends UUIDDto {
  @ApiProperty({
    description: 'Status of the ticket',
    enum: Status,
    example: Status.BOOKED,
  })
  status: Status;

  @ApiProperty({
    description: 'Price of the ticket',
    example: 150.00,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'ID of the flight associated with the ticket',
    example: 'a0b1c2d3-e4f5-6789-g0h1-i2j3k4l5m6n7',
  })
  @IsUUID()
  flightId: string;

  @ApiProperty({
    description: 'ID of the order associated with the ticket',
    example: 'a0b1c2d3-e4f5-6789-g0h1-i2j3k4l5m6n7',
  })
  @IsUUID()
  orderId: string;

  @ApiProperty({
    description: 'Direction of the flight',
    enum: Direction,
    example: Direction.THERE,
  })
  @IsEnum(Direction)
  direction: string;

  @ApiProperty({
    description: 'Passenger\'s name',
    example: 'John',
  })
  @IsString()
  passengerName: string;

  @ApiProperty({
    description: 'Passenger\'s last name',
    example: 'Doe',
  })
  @IsString()
  passengerLastName: string;

  @ApiProperty({
    description: 'Passenger\'s passport number',
    example: 'AB123456',
  })
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
