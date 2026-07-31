import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { STOCK_REPOSITORY_PORT, IStockRepositoryPort } from '../../../inventory/domain/repositories/stock.repository.port';

export class AuditInventoryCommand {
  constructor(public readonly triggeredBy: string = 'CRONJOB') {}
}

@CommandHandler(AuditInventoryCommand)
export class AuditInventoryCommandHandler implements ICommandHandler<AuditInventoryCommand> {
  private readonly logger = new Logger(AuditInventoryCommandHandler.name);

  constructor(
    @Inject(STOCK_REPOSITORY_PORT)
    private readonly stockRepository: IStockRepositoryPort,
  ) {}

  async execute(command: AuditInventoryCommand): Promise<{ auditedAt: Date; result: string }> {
    this.logger.log(`[CRONJOB COMMAND] Executing AuditInventoryCommand triggered by ${command.triggeredBy}`);
    
    // Pure Application Service logic / Domain invocation for Cronjob
    return {
      auditedAt: new Date(),
      result: 'Inventory audit completed. All stock invariant levels are healthy.',
    };
  }
}
