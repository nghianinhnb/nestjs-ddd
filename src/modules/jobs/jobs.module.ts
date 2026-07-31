import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { InventoryModule } from '../inventory/inventory.module';
import { NotificationGateway } from './presentation/gateways/notification.gateway';
import { ExportAnalyticsReportCommandHandler } from './application/commands/export-analytics-report.command';
import { AuditInventoryCommandHandler } from './application/commands/audit-inventory.command';
import { InventoryAuditCronjob } from './infrastructure/cronjobs/inventory-audit.cronjob';
import { OrderTimeoutDelayedJobService } from './infrastructure/delayed-jobs/order-timeout.job';
import { JobsController } from './presentation/jobs.controller';

const CommandHandlers = [
  ExportAnalyticsReportCommandHandler,
  AuditInventoryCommandHandler,
];

@Module({
  imports: [ScheduleModule.forRoot(), InventoryModule],
  controllers: [JobsController],
  providers: [
    ...CommandHandlers,
    NotificationGateway,
    InventoryAuditCronjob,
    OrderTimeoutDelayedJobService,
  ],
  exports: [NotificationGateway, OrderTimeoutDelayedJobService],
})
export class JobsModule {}
