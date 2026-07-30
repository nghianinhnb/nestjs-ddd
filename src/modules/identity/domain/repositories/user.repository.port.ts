import { UserAggregate } from '../aggregates/user.aggregate';

export const USER_REPOSITORY_PORT = 'USER_REPOSITORY_PORT';

export interface IUserRepositoryPort {
  save(user: UserAggregate): Promise<void>;
  findById(id: string): Promise<UserAggregate | null>;
  findByEmail(email: string): Promise<UserAggregate | null>;
}
