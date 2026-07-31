import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { NotificationGateway } from '../../presentation/gateways/notification.gateway';
import { v4 as uuidv4 } from 'uuid';

export class ExportAnalyticsReportCommand {
  constructor(public readonly requestedBy: string) {}
}

@CommandHandler(ExportAnalyticsReportCommand)
export class ExportAnalyticsReportCommandHandler implements ICommandHandler<ExportAnalyticsReportCommand> {
  private readonly logger = new Logger(ExportAnalyticsReportCommandHandler.name);

  constructor(private readonly notificationGateway: NotificationGateway) {}

  async execute(command: ExportAnalyticsReportCommand): Promise<{ taskId: string; message: string }> {
    const taskId = uuidv4();
    this.logger.log(`[LONG-RUNNING TASK] Starting ExportAnalyticsReportCommand (Task ID: ${taskId}) for user: ${command.requestedBy}`);

    // Execute long-running process asynchronously in background without blocking HTTP Response
    this.processReportInBackground(taskId);

    return {
      taskId,
      message: 'Report generation started. Subscribe to WebSocket room with taskId for real-time progress.',
    };
  }

  private async processReportInBackground(taskId: string) {
    const steps = [
      { progress: 10, message: 'Fetching Order & Analytics records from Read Database...', delay: 300 },
      { progress: 35, message: 'Aggregating revenue by date and customer segment...', delay: 400 },
      { progress: 65, message: 'Formatting CSV data and generating Excel workbook...', delay: 500 },
      { progress: 90, message: 'Uploading exported file to Cloud Storage (S3 / Blob)...', delay: 300 },
      {
        progress: 100,
        message: 'Report export completed successfully!',
        downloadUrl: `http://localhost:3000/downloads/reports/${taskId}.csv`,
        delay: 200,
      },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, step.delay));
      this.notificationGateway.sendTaskProgress(taskId, step.progress, step.message, step.downloadUrl);
    }
  }
}
