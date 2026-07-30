import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockOrmEntity } from './infrastructure/persistence/stock.orm-entity';
import { STOCK_REPOSITORY_PORT } from './domain/repositories/stock.repository.port';
import { StockRepository } from './infrastructure/persistence/stock.repository';
import { ReserveStockCommandHandler } from './application/commands/reserve-stock.command';
import { ReleaseStockCommandHandler } from './application/commands/release-stock.command';
import { AddStockCommandHandler } from './application/commands/add-stock.command';
import { GetStockByProductQueryHandler } from './application/queries/get-stock.query';
import { InventoryController } from './presentation/inventory.controller';

const CommandHandlers = [
  ReserveStockCommandHandler,
  ReleaseStockCommandHandler,
  AddStockCommandHandler,
];

const QueryHandlers = [GetStockByProductQueryHandler];

@Module({
  imports: [TypeOrmModule.forFeature([StockOrmEntity])],
  controllers: [InventoryController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: STOCK_REPOSITORY_PORT,
      useClass: StockRepository,
    },
  ],
  exports: [STOCK_REPOSITORY_PORT],
})
export class InventoryModule {}
