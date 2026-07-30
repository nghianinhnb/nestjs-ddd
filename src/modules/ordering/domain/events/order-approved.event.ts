import { IDomainEvent } from '../../../../shared/domain/domain-event.interface';
import { UniqueEntityID } from '../../../../shared/domain/unique-entity-id';

export class OrderApprovedEvent implements IDomainEvent {
  public occurredOn: Date = new Date();
  constructor(public readonly orderId: UniqueEntityID) {}

  getAggregateId(): UniqueEntityID {
    return this.orderId;
  }
}
