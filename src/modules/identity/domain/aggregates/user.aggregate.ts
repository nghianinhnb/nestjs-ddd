import { AggregateRoot } from '../../../../shared/domain/aggregate-root.base';
import { UniqueEntityID } from '../../../../shared/domain/unique-entity-id';
import { Result } from '../../../../shared/domain/result';
import { Password } from '../value-objects/password.vo';
import { UserRole } from '../enums/user-role.enum';
import { UserRegisteredEvent } from '../events/user-registered.event';

export interface UserProps {
  email: string;
  fullName: string;
  password: Password;
  role: UserRole;
  createdAt?: Date;
}

export class UserAggregate extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get email(): string {
    return this.props.email;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get password(): Password {
    return this.props.password;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get createdAt(): Date {
    return this.props.createdAt || new Date();
  }

  public static create(props: UserProps, id?: UniqueEntityID): Result<UserAggregate> {
    if (!props.email || !props.email.includes('@')) {
      return Result.fail<UserAggregate>('Invalid email address format');
    }
    if (!props.fullName || props.fullName.trim().length === 0) {
      return Result.fail<UserAggregate>('Full name is required');
    }

    const isNew = !id;
    const user = new UserAggregate(
      {
        ...props,
        createdAt: props.createdAt || new Date(),
      },
      id,
    );

    if (isNew) {
      user.addDomainEvent(new UserRegisteredEvent(user.id, user.email, user.fullName, user.role));
    }

    return Result.ok<UserAggregate>(user);
  }
}
