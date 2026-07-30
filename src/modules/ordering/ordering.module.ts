import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderOrmEntity } from './infrastructure/persistence/order.orm-entity';
import { OrderItemOrmEntity } from './infrastructure/persistence/order-item.orm-entity';
import { ORDER_REPOSITORY_PORT } from './domain/repositories/order.repository.port';
import { OrderRepository } from './infrastructure/persistence/order.repository';
import { CreateOrderCommandHandler } from './application/commands/create-order.command';
import { ApproveOrderCommandHandler } from './application/commands/approve-order.command';
import { CancelOrderCommandHandler } from './application/commands/cancel-order.command';
import { GetOrderByIdQueryHandler, GetCustomerOrdersQueryHandler } from './application/queries/get-order-by-id.query';
import { OrderingController } from './presentation/ordering.controller';

const CommandHandlers = [
  CreateOrderCommandHandler,
  ApproveOrderCommandHandler,
  CancelOrderCommandHandler,
];

const QueryHandlers = [GetOrderByIdQueryHandler, GetCustomerOrdersQueryHandler];

@Module({
  imports: [TypeOrmModule.forFeature([OrderOrmEntity, OrderItemOrmEntity])],
  controllers: [OrderingController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: ORDER_REPOSITORY_PORT,
      useClass: OrderRepository,
    },
  ],
  exports: [ORDER_REPOSITORY_PORT],
})
export class OrderingModule {}
