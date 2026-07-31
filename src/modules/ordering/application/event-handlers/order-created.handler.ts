import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OrderCreatedEvent } from '../../domain/events/order-created.event';

@EventsHandler(OrderCreatedEvent)
export class OrderCreatedDomainEventHandler implements IEventHandler<OrderCreatedEvent> {
  private readonly logger = new Logger(OrderCreatedDomainEventHandler.name);

  async handle(event: OrderCreatedEvent) {
    this.logger.log(
      `[LOCAL DOMAIN EVENT HANDLER] OrderCreatedEvent handled inside Ordering Bounded Context! ` +
        `Order ID: ${event.orderId.toString()}, Customer ID: ${event.customerId}, Total: ${event.totalAmount}`,
    );

    // Tại đây thực hiện các tác vụ NỘI BỘ của Ordering Domain:
    // Ví dụ: Gửi Email xác nhận đặt hàng cho khách, ghi log audit nội bộ context, v.v.
  }
}
