import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsSummaryOrmEntity } from '../../infrastructure/persistence/analytics-summary.orm-entity';

export class GetDashboardSummaryQuery {}

@QueryHandler(GetDashboardSummaryQuery)
export class GetDashboardSummaryQueryHandler implements IQueryHandler<GetDashboardSummaryQuery> {
  constructor(
    @InjectRepository(AnalyticsSummaryOrmEntity)
    private readonly analyticsRepository: Repository<AnalyticsSummaryOrmEntity>,
  ) {}

  async execute(_query: GetDashboardSummaryQuery): Promise<any> {
    const summary = await this.analyticsRepository.findOne({ where: { id: 'global_metrics' } });
    if (!summary) {
      return {
        totalOrders: 0,
        approvedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        conversionRate: '0%',
      };
    }

    const conversionRate = summary.totalOrders > 0
      ? `${((summary.approvedOrders / summary.totalOrders) * 100).toFixed(1)}%`
      : '0%';

    return {
      totalOrders: summary.totalOrders,
      approvedOrders: summary.approvedOrders,
      cancelledOrders: summary.cancelledOrders,
      totalRevenue: Number(summary.totalRevenue),
      conversionRate,
      updatedAt: summary.updatedAt,
    };
  }
}
