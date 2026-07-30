import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IStockRepositoryPort } from '../../domain/repositories/stock.repository.port';
import { StockAggregate } from '../../domain/aggregates/stock.aggregate';
import { StockOrmEntity } from './stock.orm-entity';
import { StockMapper } from './stock.mapper';

@Injectable()
export class StockRepository implements IStockRepositoryPort {
  constructor(
    @InjectRepository(StockOrmEntity)
    private readonly repository: Repository<StockOrmEntity>,
  ) {}

  async save(stock: StockAggregate): Promise<void> {
    const orm = StockMapper.toOrm(stock);
    await this.repository.save(orm);
  }

  async findByProductId(productId: string): Promise<StockAggregate | null> {
    const found = await this.repository.findOne({ where: { productId } });
    return found ? StockMapper.toDomain(found) : null;
  }

  async findById(id: string): Promise<StockAggregate | null> {
    const found = await this.repository.findOne({ where: { id } });
    return found ? StockMapper.toDomain(found) : null;
  }
}
