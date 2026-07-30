import { IntegrationEvent } from '../../../../shared/application/integration-event.interface';

export class PaymentProcessedIntegrationEvent extends IntegrationEvent {
  constructor(
    public readonly orderId: string,
    public readonly paymentId: string,
    public readonly amount: number,
  ) {
    super('PaymentProcessedIntegrationEvent');
  }
}

export class PaymentFailedIntegrationEvent extends IntegrationEvent {
  constructor(
    public readonly orderId: string,
    public readonly amount: number,
    public readonly reason: string,
  ) {
    super('PaymentFailedIntegrationEvent');
  }
}
