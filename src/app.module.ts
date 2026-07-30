import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from './shared/shared.module';
import { IdentityModule } from './modules/identity/identity.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrderingModule } from './modules/ordering/ordering.module';
import { PaymentModule } from './modules/payment/payment.module';
import { FulfillmentSagaModule } from './modules/fulfillment-saga/fulfillment-saga.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [__dirname + '/**/*.orm-entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    }),
    SharedModule,
    IdentityModule,
    CatalogModule,
    InventoryModule,
    OrderingModule,
    PaymentModule,
    FulfillmentSagaModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
