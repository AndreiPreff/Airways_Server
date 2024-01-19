import { Order, Status } from '@prisma/client';
import { IsEnum, IsNumber, IsUUID } from 'class-validator';
import { UUIDDto } from './uuid.dto';

export class OrderDto extends UUIDDto {
  @IsNumber()
  orderTotal: number;

  @IsEnum(Status)
  status: Status;

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
