import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EVENT_BUS_PORT, IEventBusPort } from '../../../../shared/application/ports/event-bus.port';
import { PaymentProcessedIntegrationEvent, PaymentFailedIntegrationEvent } from '../../domain/events/payment-processed.integration-event';
import { v4 as uuidv4 } from 'uuid';

export class ProcessPaymentCommand {
  constructor(
    public readonly orderId: string,
    public readonly amount: number,
    public readonly shouldSimulateFailure: boolean = false,
  ) {}
}

@CommandHandler(ProcessPaymentCommand)
export class ProcessPaymentCommandHandler implements ICommandHandler<ProcessPaymentCommand> {
  constructor(
    @Inject(EVENT_BUS_PORT)
    private readonly eventBus: IEventBusPort,
  ) {}

  async execute(command: ProcessPaymentCommand): Promise<{ success: boolean; paymentId?: string }> {
    if (command.shouldSimulateFailure || command.amount > 500000) {
      // Simulate payment failure for testing Saga Compensation
      const reason = command.shouldSimulateFailure
        ? 'Payment Gateway rejected transaction (Simulated Error)'
        : 'Amount exceeds limit of 500,000';

      const failedEvent = new PaymentFailedIntegrationEvent(command.orderId, command.amount, reason);
      await this.eventBus.publish(failedEvent);
      return { success: false };
    }

    const paymentId = uuidv4();
    const successEvent = new PaymentProcessedIntegrationEvent(command.orderId, paymentId, command.amount);
    await this.eventBus.publish(successEvent);

    return { success: true, paymentId };
  }
}
