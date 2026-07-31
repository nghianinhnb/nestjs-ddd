import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';
import { AuditInventoryCommand } from '../../application/commands/audit-inventory.command';

@Injectable()
export class InventoryAuditCronjob {
  private readonly logger = new Logger(InventoryAuditCronjob.name);

  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Scheduled Cronjob running periodically (mô phỏng mỗi 30 giây hoặc hằng ngày)
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    this.logger.log(`[SCHEDULED CRONJOB] Triggering periodic Inventory Audit...`);
    await this.commandBus.execute(new AuditInventoryCommand('SCHEDULED_CRONJOB'));
  }
}
