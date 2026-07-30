import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY_PORT, IUserRepositoryPort } from '../../domain/repositories/user.repository.port';
import { EVENT_BUS_PORT, IEventBusPort } from '../../../../shared/application/ports/event-bus.port';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';
import { Password } from '../../domain/value-objects/password.vo';
import { UserRole } from '../../domain/enums/user-role.enum';

export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly fullName: string,
    public readonly passwordStr: string,
    public readonly role: UserRole,
  ) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserCommandHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: IUserRepositoryPort,
    @Inject(EVENT_BUS_PORT)
    private readonly eventBus: IEventBusPort,
  ) {}

  async execute(command: RegisterUserCommand): Promise<{ userId: string }> {
    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) {
      throw new Error(`Email ${command.email} is already registered`);
    }

    const passwordResult = Password.create(command.passwordStr);
    if (passwordResult.isFailure) {
      throw new Error(passwordResult.errorValue() as string);
    }

    const passwordHash = await passwordResult.getValue().getHashedValue();
    const passwordVo = Password.create(passwordHash, true).getValue();

    const userResult = UserAggregate.create({
      email: command.email,
      fullName: command.fullName,
      password: passwordVo,
      role: command.role || UserRole.CUSTOMER,
    });

    if (userResult.isFailure) {
      throw new Error(userResult.errorValue() as string);
    }

    const user = userResult.getValue();
    await this.userRepository.save(user);

    // Publish domain events
    await this.eventBus.publishAll(user.domainEvents);
    user.clearEvents();

    return { userId: user.id.toString() };
  }
}
