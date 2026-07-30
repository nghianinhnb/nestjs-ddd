import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { STOCK_REPOSITORY_PORT, IStockRepositoryPort } from '../../domain/repositories/stock.repository.port';

export class GetStockByProductQuery {
  constructor(public readonly productId: string) {}
}

@QueryHandler(GetStockByProductQuery)
export class GetStockByProductQueryHandler implements IQueryHandler<GetStockByProductQuery> {
  constructor(
    @Inject(STOCK_REPOSITORY_PORT)
    private readonly stockRepository: IStockRepositoryPort,
  ) {}

  async execute(query: GetStockByProductQuery): Promise<any> {
    const stock = await this.stockRepository.findByProductId(query.productId);
    if (!stock) {
      return {
        productId: query.productId,
        quantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
      };
    }

    return {
      stockId: stock.id.toString(),
      productId: stock.productId,
      quantity: stock.quantity,
      reservedQuantity: stock.reservedQuantity,
      availableQuantity: stock.availableQuantity,
    };
  }
}
