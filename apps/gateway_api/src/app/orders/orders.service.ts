import { Injectable } from '@nestjs/common';
import { Order, Status } from '@prisma/client';
import { OrdersRepo } from '../../domain/repos/orders.repo';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepo: OrdersRepo) {}

  async createOrder(userId: string): Promise<Order> {
    const prismaOrderData = {
      order_total: 0,
      status: 'BOOKED' as Status,
      userId: userId,
    };

    return await this.ordersRepo.createOrder(prismaOrderData);
  }
}
