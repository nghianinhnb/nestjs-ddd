import { IDomainEvent } from '../../../../shared/domain/domain-event.interface';
import { UniqueEntityID } from '../../../../shared/domain/unique-entity-id';

export class OrderCreatedEvent implements IDomainEvent {
  public occurredOn: Date = new Date();
  constructor(
    public readonly orderId: UniqueEntityID,
    public readonly customerId: string,
    public readonly totalAmount: number,
  ) {}

  getAggregateId(): UniqueEntityID {
    return this.orderId;
  }
}
