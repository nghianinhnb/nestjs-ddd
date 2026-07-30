import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ORDER_REPOSITORY_PORT, IOrderRepositoryPort } from '../../domain/repositories/order.repository.port';
import { EVENT_BUS_PORT, IEventBusPort } from '../../../../shared/application/ports/event-bus.port';

export class CancelOrderCommand {
  constructor(
    public readonly orderId: string,
    public readonly reason: string,
  ) {}
}

@CommandHandler(CancelOrderCommand)
export class CancelOrderCommandHandler implements ICommandHandler<CancelOrderCommand> {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: IOrderRepositoryPort,
    @Inject(EVENT_BUS_PORT)
    private readonly eventBus: IEventBusPort,
  ) {}

  async execute(command: CancelOrderCommand): Promise<void> {
    const order = await this.orderRepository.findById(command.orderId);
    if (!order) {
      throw new Error(`Order ${command.orderId} not found`);
    }

    const result = order.cancelOrder(command.reason);
    if (result.isFailure) {
      throw new Error(result.errorValue() as string);
    }

    await this.orderRepository.save(order);
    await this.eventBus.publishAll(order.domainEvents);
    order.clearEvents();
  }
}
