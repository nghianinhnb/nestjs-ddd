import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsSummaryOrmEntity } from './infrastructure/persistence/analytics-summary.orm-entity';
import { OrderAnalyticsProjection } from './application/event-handlers/order-analytics.projection';
import { GetDashboardSummaryQueryHandler } from './application/queries/get-dashboard-summary.query';
import { AnalyticsController } from './presentation/analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticsSummaryOrmEntity])],
  controllers: [AnalyticsController],
  providers: [OrderAnalyticsProjection, GetDashboardSummaryQueryHandler],
})
export class AnalyticsModule {}
