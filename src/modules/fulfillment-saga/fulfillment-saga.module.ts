import { Module } from '@nestjs/common';
import { OrderFulfillmentSaga } from './order-fulfillment.saga';

@Module({
  providers: [OrderFulfillmentSaga],
})
export class FulfillmentSagaModule {}
