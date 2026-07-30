import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { STOCK_REPOSITORY_PORT, IStockRepositoryPort } from '../../domain/repositories/stock.repository.port';
import { EVENT_BUS_PORT, IEventBusPort } from '../../../../shared/application/ports/event-bus.port';

export class ReleaseStockCommand {
  constructor(
    public readonly orderId: string,
    public readonly items: { productId: string; quantity: number }[],
  ) {}
}

@CommandHandler(ReleaseStockCommand)
export class ReleaseStockCommandHandler implements ICommandHandler<ReleaseStockCommand> {
  constructor(
    @Inject(STOCK_REPOSITORY_PORT)
    private readonly stockRepository: IStockRepositoryPort,
    @Inject(EVENT_BUS_PORT)
    private readonly eventBus: IEventBusPort,
  ) {}

  async execute(command: ReleaseStockCommand): Promise<void> {
    for (const item of command.items) {
      const stock = await this.stockRepository.findByProductId(item.productId);
      if (stock) {
        stock.releaseStock(command.orderId, item.quantity);
        await this.stockRepository.save(stock);
        await this.eventBus.publishAll(stock.domainEvents);
        stock.clearEvents();
      }
    }
  }
}
