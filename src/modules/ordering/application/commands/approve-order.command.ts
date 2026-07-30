import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ORDER_REPOSITORY_PORT, IOrderRepositoryPort } from '../../domain/repositories/order.repository.port';
import { EVENT_BUS_PORT, IEventBusPort } from '../../../../shared/application/ports/event-bus.port';

export class ApproveOrderCommand {
  constructor(public readonly orderId: string) {}
}

@CommandHandler(ApproveOrderCommand)
export class ApproveOrderCommandHandler implements ICommandHandler<ApproveOrderCommand> {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: IOrderRepositoryPort,
    @Inject(EVENT_BUS_PORT)
    private readonly eventBus: IEventBusPort,
  ) {}

  async execute(command: ApproveOrderCommand): Promise<void> {
    const order = await this.orderRepository.findById(command.orderId);
    if (!order) {
      throw new Error(`Order ${command.orderId} not found`);
    }

    const result = order.approveOrder();
    if (result.isFailure) {
      throw new Error(result.errorValue() as string);
    }

    await this.orderRepository.save(order);
    await this.eventBus.publishAll(order.domainEvents);
    order.clearEvents();
  }
}
