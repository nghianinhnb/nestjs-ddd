import { StockAggregate } from '../aggregates/stock.aggregate';

export const STOCK_REPOSITORY_PORT = 'STOCK_REPOSITORY_PORT';

export interface IStockRepositoryPort {
  save(stock: StockAggregate): Promise<void>;
  findByProductId(productId: string): Promise<StockAggregate | null>;
  findById(id: string): Promise<StockAggregate | null>;
}
