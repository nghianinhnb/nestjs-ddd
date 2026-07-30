import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ORDER_REPOSITORY_PORT, IOrderRepositoryPort } from '../../domain/repositories/order.repository.port';
import { EVENT_BUS_PORT, IEventBusPort } from '../../../../shared/application/ports/event-bus.port';
import { OrderAggregate } from '../../domain/aggregates/order.aggregate';
import { OrderItem } from '../../domain/value-objects/order-item.vo';

export class CreateOrderCommand {
  constructor(
    public readonly customerId: string,
    public readonly items: { productId: string; productName: string; unitPrice: number; quantity: number }[],
  ) {}
}

@CommandHandler(CreateOrderCommand)
export class CreateOrderCommandHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: IOrderRepositoryPort,
    @Inject(EVENT_BUS_PORT)
    private readonly eventBus: IEventBusPort,
  ) {}

  async execute(command: CreateOrderCommand): Promise<{ orderId: string; totalAmount: number }> {
    const itemVos: OrderItem[] = [];
    for (const item of command.items) {
      const voResult = OrderItem.create(item);
      if (voResult.isFailure) {
        throw new Error(voResult.errorValue() as string);
      }
      itemVos.push(voResult.getValue());
    }

    const orderResult = OrderAggregate.create({
      customerId: command.customerId,
      items: itemVos,
    });

    if (orderResult.isFailure) {
      throw new Error(orderResult.errorValue() as string);
    }

    const order = orderResult.getValue();
    const placeResult = order.placeOrder();
    if (placeResult.isFailure) {
      throw new Error(placeResult.errorValue() as string);
    }

    await this.orderRepository.save(order);

    // Publish all events (DomainEvent and OrderPlacedIntegrationEvent for Saga)
    await this.eventBus.publishAll(order.domainEvents);
    order.clearEvents();

    return {
      orderId: order.id.toString(),
      totalAmount: order.totalAmount,
    };
  }
}
