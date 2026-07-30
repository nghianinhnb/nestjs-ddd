import { Module } from '@nestjs/common';
import { ProcessPaymentCommandHandler } from './application/commands/process-payment.command';
import { PaymentController } from './presentation/payment.controller';

@Module({
  controllers: [PaymentController],
  providers: [ProcessPaymentCommandHandler],
})
export class PaymentModule {}
