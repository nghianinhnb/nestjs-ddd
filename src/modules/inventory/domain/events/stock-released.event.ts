import { IDomainEvent } from '../../../../shared/domain/domain-event.interface';
import { UniqueEntityID } from '../../../../shared/domain/unique-entity-id';

export class StockReleasedEvent implements IDomainEvent {
  public occurredOn: Date = new Date();
  constructor(
    public readonly stockId: UniqueEntityID,
    public readonly orderId: string,
    public readonly productId: string,
    public readonly quantity: number,
  ) {}

  getAggregateId(): UniqueEntityID {
    return this.stockId;
  }
}
