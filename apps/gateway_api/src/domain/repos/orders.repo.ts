import { Injectable } from '@nestjs/common';
import { Order, PrismaClient, Status } from '@prisma/client';
import { PrismaService } from 'libs/prisma/prisma.service';

@Injectable()
export class OrdersRepo {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(
    user: Pick<Order, 'userId'>,
    prisma?: PrismaClient,
  ): Promise<Order> {
    const orderData = {
      order_total: 0,
      status: 'BOOKED' as Status,
      userId: user.userId,
    };
    return await (prisma || this.prisma).order.create({ data: orderData });
  }

  async getOrdersById(order: Pick<Order, 'userId'>): Promise<Order[]> {
    return await this.prisma.order.findMany({
      where: {
        userId: order.userId,
        status: 'BOOKED',
      },
    });
  }

  async updateOrder(
    order: Pick<Order, 'id' | 'order_total'>,
    prisma?: PrismaClient,
  ): Promise<Order> {
    return await (prisma || this.prisma).order.update({
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

  async updateOrderStatus(
    order: Pick<Order, 'id' | 'status'>,
    prisma?: PrismaClient,
  ): Promise<Order> {
    const existingOrder = await (prisma || this.prisma).order.findUnique({
      where: {
        id: order.id,
      },
    });
    if (existingOrder.status === 'CANCELLED') {
      return null;
    }
    const updatedOrder = await (prisma || this.prisma).order.update({
      where: {
        id: order.id,
      },
      data: {
        status: order.status,
      },
    });
    if (order.status === 'CANCELLED') {
      await (prisma || this.prisma).order.update({
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

  async getAllOrders(order: Pick<Order, 'userId'>): Promise<Order[]> {
    return await this.prisma.order.findMany({
      where: {
        userId: order.userId,
        status: {
          in: ['BOOKED', 'PAID'],
        },
      },
    });
  }

  async deleteOrders(order: Pick<Order, 'userId'>) {
    const orders = await this.prisma.order.findMany({
      where: {
        userId: order.userId,
      },
      include: {
        tickets: true,
      },
    });
    await this.prisma.message.deleteMany({
      where: {
        roomId: order.userId,
      },
    });

    for (const order of orders) {
      for (const ticket of order.tickets) {
        await this.prisma.ticket.delete({
          where: {
            id: ticket.id,
          },
        });
      }
      await this.prisma.order.delete({
        where: {
          id: order.id,
        },
      });
    }
  }
}
