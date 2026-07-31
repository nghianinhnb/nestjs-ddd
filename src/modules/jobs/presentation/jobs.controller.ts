import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExportAnalyticsReportCommand } from '../application/commands/export-analytics-report.command';
import { AuditInventoryCommand } from '../application/commands/audit-inventory.command';
import { OrderTimeoutDelayedJobService } from '../infrastructure/delayed-jobs/order-timeout.job';
import { JwtAuthGuard } from '../../identity/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../identity/infrastructure/decorators/current-user.decorator';

class ScheduleTimeoutDto {
  orderId: string;
  delaySeconds?: number;
}

@ApiTags('Background Tasks & WebSockets (Jobs)')
@Controller('jobs')
export class JobsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly delayedJobService: OrderTimeoutDelayedJobService,
  ) {}

  @Post('export-report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Kích hoạt Long-Running Task (Xuất báo cáo ngầm & phát tiến độ WebSocket realtime)',
  })
  async exportReport(@CurrentUser('email') userEmail: string) {
    return this.commandBus.execute(new ExportAnalyticsReportCommand(userEmail || 'admin@ddd.com'));
  }

  @Post('schedule-order-timeout')
  @ApiOperation({ summary: 'Kích hoạt Delayed Job (Hủy đơn hàng sau thời gian đếm ngược)' })
  async scheduleOrderTimeout(@Body() dto: ScheduleTimeoutDto) {
    const delayMs = (dto.delaySeconds || 10) * 1000;
    this.delayedJobService.scheduleOrderPaymentTimeout(dto.orderId, delayMs);
    return {
      message: `Delayed job scheduled. Order ${dto.orderId} will auto-cancel in ${dto.delaySeconds || 10} seconds if unpaid.`,
    };
  }

  @Post('trigger-inventory-audit')
  @ApiOperation({ summary: 'Kích hoạt thủ công công việc của Cronjob (Inventory Audit)' })
  async triggerAudit() {
    return this.commandBus.execute(new AuditInventoryCommand('MANUAL_API_TRIGGER'));
  }
}
