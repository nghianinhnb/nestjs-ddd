import { Controller, Post, Body } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProcessPaymentCommand } from '../application/commands/process-payment.command';

class ManualPaymentRequestDto {
  orderId: string;
  amount: number;
  shouldFail?: boolean;
}

@ApiTags('Payment (Event-Driven Gateway)')
@Controller('payments')
export class PaymentController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('process')
  @ApiOperation({ summary: 'Thực hiện thanh toán thủ công (để test hoặc retry)' })
  async processPayment(@Body() dto: ManualPaymentRequestDto) {
    return this.commandBus.execute(new ProcessPaymentCommand(dto.orderId, dto.amount, dto.shouldFail));
  }
}
