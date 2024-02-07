import { Order, Ticket } from '@prisma/client';
import { OrderDto } from './order.dto';
import { TicketInfoDto } from './ticketInfo.dto';
import { ApiProperty } from '@nestjs/swagger';

export class OrderWithTicketsDto {
  @ApiProperty({
    description: 'Details of the order',
    type: OrderDto,
  })
  order: OrderDto;

  @ApiProperty({
    description: 'List of tickets associated with the order',
    type: [TicketInfoDto],
  })
  tickets: TicketInfoDto[];

  constructor(order: Order, tickets: Ticket[]) {
    this.order = OrderDto.fromEntity(order)!;
    this.tickets = tickets.map((ticket) => TicketInfoDto.fromEntity(ticket)!);
  }

  static fromEntities(
    entities?: { order: Order; tickets: Ticket[] }[],
  ): OrderWithTicketsDto[] | undefined {
    if (!entities?.map) {
      return undefined;
    }

    return entities.map(
      (entity) => new OrderWithTicketsDto(entity.order, entity.tickets),
    );
  }
}
