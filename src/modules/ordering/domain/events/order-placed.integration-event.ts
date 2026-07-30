import { IntegrationEvent } from '../../../../shared/application/integration-event.interface';

export class OrderPlacedIntegrationEvent extends IntegrationEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly totalAmount: number,
    public readonly items: { productId: string; quantity: number; unitPrice: number }[],
  ) {
    super('OrderPlacedIntegrationEvent');
  }
}
