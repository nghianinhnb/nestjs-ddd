import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { USER_REPOSITORY_PORT } from './domain/repositories/user.repository.port';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { RegisterUserCommandHandler } from './application/commands/register-user.command';
import { LoginUserCommandHandler } from './application/commands/login-user.command';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { AuthController } from './presentation/auth.controller';

const CommandHandlers = [RegisterUserCommandHandler, LoginUserCommandHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKeyForDDDModularMonolith',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...CommandHandlers,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: USER_REPOSITORY_PORT,
      useClass: UserRepository,
    },
  ],
  exports: [USER_REPOSITORY_PORT, JwtAuthGuard, RolesGuard],
})
export class IdentityModule {}
