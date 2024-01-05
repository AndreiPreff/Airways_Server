import { Injectable } from '@nestjs/common';
import { Order } from '@prisma/client';
import { PrismaService } from 'libs/prisma/prisma.service';

@Injectable()
export class OrdersRepo {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(
    orderData: Pick<Order, 'status' | 'order_total' | 'userId'>,
  ) {
    return await this.prisma.order.create({ data: orderData });
  }
}
