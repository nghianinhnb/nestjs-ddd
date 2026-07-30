import { IDomainEvent } from '../../../../shared/domain/domain-event.interface';
import { UniqueEntityID } from '../../../../shared/domain/unique-entity-id';
import { UserRole } from '../enums/user-role.enum';

export class UserRegisteredEvent implements IDomainEvent {
  public occurredOn: Date;
  public readonly userId: UniqueEntityID;
  public readonly email: string;
  public readonly fullName: string;
  public readonly role: UserRole;

  constructor(userId: UniqueEntityID, email: string, fullName: string, role: UserRole) {
    this.occurredOn = new Date();
    this.userId = userId;
    this.email = email;
    this.fullName = fullName;
    this.role = role;
  }

  getAggregateId(): UniqueEntityID {
    return this.userId;
  }
}
