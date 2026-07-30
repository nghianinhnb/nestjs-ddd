import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepositoryPort } from '../../domain/repositories/user.repository.port';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';
import { UserOrmEntity } from './user.orm-entity';
import { UserMapper } from './user.mapper';

@Injectable()
export class UserRepository implements IUserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async save(user: UserAggregate): Promise<void> {
    const orm = UserMapper.toOrm(user);
    await this.repository.save(orm);
  }

  async findById(id: string): Promise<UserAggregate | null> {
    const found = await this.repository.findOne({ where: { id } });
    return found ? UserMapper.toDomain(found) : null;
  }

  async findByEmail(email: string): Promise<UserAggregate | null> {
    const found = await this.repository.findOne({ where: { email } });
    return found ? UserMapper.toDomain(found) : null;
  }
}
