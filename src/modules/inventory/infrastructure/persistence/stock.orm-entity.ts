import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('stocks')
export class StockOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  productId: string;

  @Column('int', { default: 0 })
  quantity: number;

  @Column('int', { default: 0 })
  reservedQuantity: number;
}
