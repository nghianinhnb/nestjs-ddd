import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrderRepositoryPort } from '../../domain/repositories/order.repository.port';
import { OrderAggregate } from '../../domain/aggregates/order.aggregate';
import { OrderOrmEntity } from './order.orm-entity';
import { OrderMapper } from './order.mapper';

@Injectable()
export class OrderRepository implements IOrderRepositoryPort {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly repository: Repository<OrderOrmEntity>,
  ) {}

  async save(order: OrderAggregate): Promise<void> {
    const orm = OrderMapper.toOrm(order);
    await this.repository.save(orm);
  }

  async findById(id: string): Promise<OrderAggregate | null> {
    const found = await this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
    return found ? OrderMapper.toDomain(found) : null;
  }

  async findByCustomerId(customerId: string): Promise<OrderAggregate[]> {
    const founds = await this.repository.find({
      where: { customerId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
    return founds.map((f) => OrderMapper.toDomain(f));
  }
}
