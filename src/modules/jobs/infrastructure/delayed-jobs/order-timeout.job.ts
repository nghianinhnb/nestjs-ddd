import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CancelOrderCommand } from '../../../ordering/application/commands/cancel-order.command';

@Injectable()
export class OrderTimeoutDelayedJobService {
  private readonly logger = new Logger(OrderTimeoutDelayedJobService.name);

  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Schedule a Delayed Job (Worker) to auto-cancel order if payment is not completed within timeout window
   * @param orderId ID of order to check
   * @param delayMs Delay in milliseconds (e.g. 10000ms = 10s for demo, 1800000ms = 30m in production)
   */
  public scheduleOrderPaymentTimeout(orderId: string, delayMs: number = 10000) {
    this.logger.log(`[DELAYED JOB SCHEDULED] Order ${orderId} will auto-cancel in ${delayMs / 1000} seconds if unpaid.`);

    setTimeout(async () => {
      this.logger.log(`[DELAYED JOB EXECUTION] Timeout reached for Order ${orderId}. Checking & executing cancellation...`);
      try {
        await this.commandBus.execute(new CancelOrderCommand(orderId, 'Payment timeout exceeded (Delayed Job Worker)'));
      } catch (err) {
        // Order may already be APPROVED or CANCELLED, aggregate invariant will gracefully handle
        this.logger.debug(`[DELAYED JOB RESULT] Order ${orderId} state check: ${err.message}`);
      }
    }, delayMs);
  }
}
