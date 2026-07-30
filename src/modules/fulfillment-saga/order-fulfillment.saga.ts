import { Injectable, Logger } from '@nestjs/common';
import { Saga, ICommand, ofType } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { OrderPlacedIntegrationEvent } from '../ordering/domain/events/order-placed.integration-event';
import { StockReservedEvent } from '../inventory/domain/events/stock-reserved.event';
import { StockReservationFailedEvent } from '../inventory/domain/events/stock-reservation-failed.event';
import { PaymentProcessedIntegrationEvent, PaymentFailedIntegrationEvent } from '../payment/domain/events/payment-processed.integration-event';
import { ReserveStockCommand } from '../inventory/application/commands/reserve-stock.command';
import { ProcessPaymentCommand } from '../payment/application/commands/process-payment.command';
import { ApproveOrderCommand } from '../ordering/application/commands/approve-order.command';
import { CancelOrderCommand } from '../ordering/application/commands/cancel-order.command';
import { ReleaseStockCommand } from '../inventory/application/commands/release-stock.command';

@Injectable()
export class OrderFulfillmentSaga {
  private readonly logger = new Logger(OrderFulfillmentSaga.name);

  // Store order state temporarily in saga memory map for compensating actions & step data
  private sagaStateCache: Map<string, { totalAmount: number; items: { productId: string; quantity: number }[] }> = new Map();

  /**
   * Step 1: When Order is Placed -> Command Inventory to Reserve Stock
   */
  @Saga()
  orderPlaced = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(OrderPlacedIntegrationEvent),
      map((event: OrderPlacedIntegrationEvent) => {
        this.logger.log(`[SAGA STEP 1] Order ${event.orderId} placed (Total: ${event.totalAmount}). Triggering ReserveStockCommand...`);
        this.sagaStateCache.set(event.orderId, { totalAmount: event.totalAmount, items: event.items });
        return new ReserveStockCommand(event.orderId, event.items);
      }),
    );
  };

  /**
   * Step 2a: Stock Reserved Successfully -> Command Payment to Process Payment
   */
  @Saga()
  stockReserved = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(StockReservedEvent),
      map((event: StockReservedEvent) => {
        const state = this.sagaStateCache.get(event.orderId);
        const amount = state ? state.totalAmount : 150000;
        this.logger.log(`[SAGA STEP 2a] Stock reserved for order ${event.orderId}. Triggering ProcessPaymentCommand for amount ${amount}...`);
        return new ProcessPaymentCommand(event.orderId, amount);
      }),
    );
  };

  /**
   * Step 2b: Stock Reservation Failed -> Compensating Action: Cancel Order
   */
  @Saga()
  stockFailed = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(StockReservationFailedEvent),
      map((event: StockReservationFailedEvent) => {
        this.logger.warn(`[SAGA ROLLBACK] Stock reservation failed for order ${event.orderId}: ${event.reason}`);
        this.sagaStateCache.delete(event.orderId);
        return new CancelOrderCommand(event.orderId, `Stock reservation failed: ${event.reason}`);
      }),
    );
  };

  /**
   * Step 3a: Payment Processed Successfully -> Approve Order
   */
  @Saga()
  paymentCompleted = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(PaymentProcessedIntegrationEvent),
      map((event: PaymentProcessedIntegrationEvent) => {
        this.logger.log(`[SAGA STEP 3a] Payment ${event.paymentId} completed for order ${event.orderId}. Approving order!`);
        this.sagaStateCache.delete(event.orderId);
        return new ApproveOrderCommand(event.orderId);
      }),
    );
  };

  /**
   * Step 3b: Payment Failed -> Compensating Actions: Release Stock & Cancel Order
   */
  @Saga()
  paymentFailed = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(PaymentFailedIntegrationEvent),
      mergeMap((event: PaymentFailedIntegrationEvent) => {
        this.logger.warn(`[SAGA ROLLBACK] Payment failed for order ${event.orderId}: ${event.reason}. Executing compensating actions...`);
        const state = this.sagaStateCache.get(event.orderId);
        const items = state ? state.items : [];
        this.sagaStateCache.delete(event.orderId);

        return [
          new ReleaseStockCommand(event.orderId, items),
          new CancelOrderCommand(event.orderId, `Payment failed: ${event.reason}`),
        ];
      }),
    );
  };
}
