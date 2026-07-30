import { UniqueEntityID } from './unique-entity-id';

export interface IDomainEvent {
  occurredOn: Date;
  getAggregateId(): UniqueEntityID;
}
