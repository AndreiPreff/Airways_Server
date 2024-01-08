import { Injectable } from '@nestjs/common';
import { Order, Status } from '@prisma/client';
import { PrismaService } from 'libs/prisma/prisma.service';

@Injectable()
export class OrdersRepo {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(user: Pick<Order, 'userId'>) {
    const orderData = {
      order_total: 0,
      status: 'BOOKED' as Status,
      userId: user.userId,
    };
    return await this.prisma.order.create({ data: orderData });
  }

  async updateOrder(order: Pick<Order, 'id' | 'order_total'>) {
    return await this.prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        order_total: {
          increment: order.order_total,
        },
      },
    });
  }

  async updateOrderStatus(order: Pick<Order, 'id' | 'status'>) {
    return await this.prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: order.status,
      },
    });
  }
}
