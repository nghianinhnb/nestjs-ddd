import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { STOCK_REPOSITORY_PORT, IStockRepositoryPort } from '../../domain/repositories/stock.repository.port';
import { EVENT_BUS_PORT, IEventBusPort } from '../../../../shared/application/ports/event-bus.port';
import { StockReservationFailedEvent } from '../../domain/events/stock-reservation-failed.event';

export class ReserveStockCommand {
  constructor(
    public readonly orderId: string,
    public readonly items: { productId: string; quantity: number }[],
  ) {}
}

@CommandHandler(ReserveStockCommand)
export class ReserveStockCommandHandler implements ICommandHandler<ReserveStockCommand> {
  constructor(
    @Inject(STOCK_REPOSITORY_PORT)
    private readonly stockRepository: IStockRepositoryPort,
    @Inject(EVENT_BUS_PORT)
    private readonly eventBus: IEventBusPort,
  ) {}

  async execute(command: ReserveStockCommand): Promise<{ success: boolean; reason?: string }> {
    for (const item of command.items) {
      const stock = await this.stockRepository.findByProductId(item.productId);

      if (!stock) {
        const reason = `Stock record not found for product ID ${item.productId}`;
        const failedEvent = new StockReservationFailedEvent(command.orderId, item.productId, item.quantity, reason);
        await this.eventBus.publish(failedEvent);
        return { success: false, reason };
      }

      const reserveResult = stock.reserveStock(command.orderId, item.quantity);

      // Publish events (StockReservedEvent or StockReservationFailedEvent)
      await this.eventBus.publishAll(stock.domainEvents);

      if (reserveResult.isFailure) {
        stock.clearEvents();
        return { success: false, reason: reserveResult.errorValue() as string };
      }

      await this.stockRepository.save(stock);
      stock.clearEvents();
    }

    return { success: true };
  }
}
