import { OrderAggregate } from '../aggregates/order.aggregate';

export const ORDER_REPOSITORY_PORT = 'ORDER_REPOSITORY_PORT';

export interface IOrderRepositoryPort {
  save(order: OrderAggregate): Promise<void>;
  findById(id: string): Promise<OrderAggregate | null>;
  findByCustomerId(customerId: string): Promise<OrderAggregate[]>;
}
