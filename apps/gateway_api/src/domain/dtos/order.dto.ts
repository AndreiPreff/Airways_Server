import { Order, Status } from '@prisma/client';
import { IsEnum, IsNumber, IsUUID } from 'class-validator';
import { UUIDDto } from './uuid.dto';
import { ApiProperty } from '@nestjs/swagger';

export class OrderDto extends UUIDDto {
  @ApiProperty({
    description: 'Total amount of the order',
    example: 150.00,
  })
  @IsNumber()
  orderTotal: number;

  @ApiProperty({
    description: 'Current status of the order',
    enum: Status,
    example: Status.PAID,
  })
  @IsEnum(Status)
  status: Status;

  @ApiProperty({
    description: 'User ID associated with the order',
    example: 'a0b1c2d3-e4f5-6789-g0h1-i2j3k4l5m6n7',
  })
  @IsUUID()
  userId: string;

  static fromEntity(entity?: Order): OrderDto | undefined {
    if (!entity) {
      return undefined;
    }

    const dto = new OrderDto();
    dto.id = entity.id;
    dto.createdAt = entity.createdAt.valueOf();
    dto.updatedAt = entity.updatedAt.valueOf();
    dto.orderTotal = entity.order_total;
    dto.status = entity.status;
    dto.userId = entity.userId;

    return dto;
  }

  static fromEntities(entities?: Order[]): OrderDto[] | undefined {
    if (!entities?.map) {
      return undefined;
    }

    return entities.map((entity) => this.fromEntity(entity)!);
  }
}
