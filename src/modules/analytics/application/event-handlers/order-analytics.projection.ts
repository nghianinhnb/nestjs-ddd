import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsSummaryOrmEntity } from '../../infrastructure/persistence/analytics-summary.orm-entity';
import { OrderPlacedIntegrationEvent } from '../../../ordering/domain/events/order-placed.integration-event';
import { OrderApprovedEvent } from '../../../ordering/domain/events/order-approved.event';
import { OrderCancelledEvent } from '../../../ordering/domain/events/order-cancelled.event';
import { PaymentProcessedIntegrationEvent } from '../../../payment/domain/events/payment-processed.integration-event';

@Injectable()
export class OrderAnalyticsProjection {
  private readonly logger = new Logger(OrderAnalyticsProjection.name);

  constructor(
    @InjectRepository(AnalyticsSummaryOrmEntity)
    private readonly analyticsRepository: Repository<AnalyticsSummaryOrmEntity>,
  ) { }

  private async getOrCreateMetrics(): Promise<AnalyticsSummaryOrmEntity> {
    let metrics = await this.analyticsRepository.findOne({ where: { id: 'global_metrics' } });
    if (!metrics) {
      metrics = this.analyticsRepository.create({
        id: 'global_metrics',
        totalOrders: 0,
        approvedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
      });
    }
    return metrics;
  }

  @OnEvent('OrderPlacedIntegrationEvent')
  async handleOrderPlaced(event: OrderPlacedIntegrationEvent) {
    this.logger.log(`[PROJECTION] Processing OrderPlacedIntegrationEvent for Order ${event.orderId}`);
    const metrics = await this.getOrCreateMetrics();
    metrics.totalOrders += 1;
    await this.analyticsRepository.save(metrics);
  }

  @OnEvent('OrderApprovedEvent')
  async handleOrderApproved(event: OrderApprovedEvent) {
    this.logger.log(`[PROJECTION] Processing OrderApprovedEvent for Order ${event.orderId}`);
    const metrics = await this.getOrCreateMetrics();
    metrics.approvedOrders += 1;
    await this.analyticsRepository.save(metrics);
  }

  @OnEvent('OrderCancelledEvent')
  async handleOrderCancelled(event: OrderCancelledEvent) {
    this.logger.log(`[PROJECTION] Processing OrderCancelledEvent for Order ${event.orderId}`);
    const metrics = await this.getOrCreateMetrics();
    metrics.cancelledOrders += 1;
    await this.analyticsRepository.save(metrics);
  }

  @OnEvent('PaymentProcessedIntegrationEvent')
  async handlePaymentProcessed(event: PaymentProcessedIntegrationEvent) {
    this.logger.log(`[PROJECTION] Processing PaymentProcessedIntegrationEvent adding ${event.amount} to revenue`);
    const metrics = await this.getOrCreateMetrics();
    metrics.totalRevenue = Number(metrics.totalRevenue) + Number(event.amount);
    await this.analyticsRepository.save(metrics);
  }
}
