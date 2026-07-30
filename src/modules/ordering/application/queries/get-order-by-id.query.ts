import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ORDER_REPOSITORY_PORT, IOrderRepositoryPort } from '../../domain/repositories/order.repository.port';

export class GetOrderByIdQuery {
  constructor(public readonly orderId: string) {}
}

export class GetCustomerOrdersQuery {
  constructor(public readonly customerId: string) {}
}

@QueryHandler(GetOrderByIdQuery)
export class GetOrderByIdQueryHandler implements IQueryHandler<GetOrderByIdQuery> {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: IOrderRepositoryPort,
  ) {}

  async execute(query: GetOrderByIdQuery): Promise<any> {
    const order = await this.orderRepository.findById(query.orderId);
    if (!order) {
      throw new NotFoundException(`Order ${query.orderId} not found`);
    }

    return {
      orderId: order.id.toString(),
      customerId: order.customerId,
      status: order.status,
      totalAmount: order.totalAmount,
      cancellationReason: order.cancellationReason,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        totalPrice: i.totalPrice,
      })),
    };
  }
}

@QueryHandler(GetCustomerOrdersQuery)
export class GetCustomerOrdersQueryHandler implements IQueryHandler<GetCustomerOrdersQuery> {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: IOrderRepositoryPort,
  ) {}

  async execute(query: GetCustomerOrdersQuery): Promise<any[]> {
    const orders = await this.orderRepository.findByCustomerId(query.customerId);
    return orders.map((order) => ({
      orderId: order.id.toString(),
      customerId: order.customerId,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      itemsCount: order.items.length,
    }));
  }
}
