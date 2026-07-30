import { IDomainEvent } from '../../../../shared/domain/domain-event.interface';
import { UniqueEntityID } from '../../../../shared/domain/unique-entity-id';

export class StockReservationFailedEvent implements IDomainEvent {
  public occurredOn: Date = new Date();
  constructor(
    public readonly orderId: string,
    public readonly productId: string,
    public readonly requestedQuantity: number,
    public readonly reason: string,
  ) {}

  getAggregateId(): UniqueEntityID {
    return new UniqueEntityID(this.orderId);
  }
}
