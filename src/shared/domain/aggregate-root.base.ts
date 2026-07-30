import { Entity } from './entity.base';
import { IDomainEvent } from './domain-event.interface';
import { UniqueEntityID } from './unique-entity-id';

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: IDomainEvent[] = [];

  get domainEvents(): IDomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: IDomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  public clearEvents(): void {
    this._domainEvents.splice(0, this._domainEvents.length);
  }

  public equals(object?: AggregateRoot<T>): boolean {
    if (object == null || object == undefined) {
      return false;
    }
    if (this === object) {
      return true;
    }
    if (!(object instanceof AggregateRoot)) {
      return false;
    }
    return this._id.equals(object._id);
  }
}
