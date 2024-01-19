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

  async getOrdersById(order: Pick<Order, 'userId'>) {
    return await this.prisma.order.findMany({
      where: {
        userId: order.userId,
        status: 'BOOKED',
      },
    });
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
    const existingOrder = await this.prisma.order.findUnique({
      where: {
        id: order.id,
      },
    });
    if (existingOrder.status === 'CANCELLED') {
      return null;
    }
    const updatedOrder = await this.prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: order.status,
      },
    });
    if (order.status === 'CANCELLED') {
      await this.prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          order_total: 0,
        },
      });
    }

    return updatedOrder;
  }

  async getAllOrders(order: Pick<Order, 'userId'>) {
    return await this.prisma.order.findMany({
      where: {
        userId: order.userId,
      },
    });
  }
}
