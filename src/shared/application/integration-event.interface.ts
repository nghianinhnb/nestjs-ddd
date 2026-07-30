import { IDomainEvent } from '../domain/domain-event.interface';
import { UniqueEntityID } from '../domain/unique-entity-id';
import { v4 as uuidv4 } from 'uuid';

export interface IIntegrationEvent extends IDomainEvent {
  eventId: string;
  occurredOn: Date;
  eventType: string;
}

export abstract class IntegrationEvent implements IIntegrationEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly eventType: string;

  constructor(eventType: string) {
    this.eventId = uuidv4();
    this.occurredOn = new Date();
    this.eventType = eventType;
  }

  getAggregateId(): UniqueEntityID {
    return new UniqueEntityID(this.eventId);
  }
}
