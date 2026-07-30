import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('analytics_summary')
export class AnalyticsSummaryOrmEntity {
  @PrimaryColumn()
  id: string = 'global_metrics';

  @Column('int', { default: 0 })
  totalOrders: number;

  @Column('int', { default: 0 })
  approvedOrders: number;

  @Column('int', { default: 0 })
  cancelledOrders: number;

  @Column('decimal', { default: 0 })
  totalRevenue: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
