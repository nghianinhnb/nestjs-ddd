import { UserOrmEntity } from './user.orm-entity';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';
import { UniqueEntityID } from '../../../../shared/domain/unique-entity-id';
import { Password } from '../../domain/value-objects/password.vo';

export class UserMapper {
  public static toDomain(orm: UserOrmEntity): UserAggregate {
    const password = Password.create(orm.passwordHash, true).getValue();
    const userResult = UserAggregate.create(
      {
        email: orm.email,
        fullName: orm.fullName,
        password,
        role: orm.role,
        createdAt: orm.createdAt,
      },
      new UniqueEntityID(orm.id),
    );

    return userResult.getValue();
  }

  public static toOrm(domain: UserAggregate): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = domain.id.toString();
    orm.email = domain.email;
    orm.fullName = domain.fullName;
    orm.passwordHash = domain.password.value;
    orm.role = domain.role;
    orm.createdAt = domain.createdAt;
    return orm;
  }
}
