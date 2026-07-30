import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { STOCK_REPOSITORY_PORT, IStockRepositoryPort } from '../../domain/repositories/stock.repository.port';
import { StockAggregate } from '../../domain/aggregates/stock.aggregate';

export class AddStockCommand {
  constructor(
    public readonly productId: string,
    public readonly quantity: number,
  ) {}
}

@CommandHandler(AddStockCommand)
export class AddStockCommandHandler implements ICommandHandler<AddStockCommand> {
  constructor(
    @Inject(STOCK_REPOSITORY_PORT)
    private readonly stockRepository: IStockRepositoryPort,
  ) {}

  async execute(command: AddStockCommand): Promise<{ stockId: string }> {
    let stock = await this.stockRepository.findByProductId(command.productId);

    if (!stock) {
      const stockResult = StockAggregate.create({
        productId: command.productId,
        quantity: command.quantity,
        reservedQuantity: 0,
      });

      if (stockResult.isFailure) {
        throw new Error(stockResult.errorValue() as string);
      }
      stock = stockResult.getValue();
    } else {
      stock.addStock(command.quantity);
    }

    await this.stockRepository.save(stock);
    return { stockId: stock.id.toString() };
  }
}
