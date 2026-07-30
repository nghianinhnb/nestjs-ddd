import { StockOrmEntity } from './stock.orm-entity';
import { StockAggregate } from '../../domain/aggregates/stock.aggregate';
import { UniqueEntityID } from '../../../../shared/domain/unique-entity-id';

export class StockMapper {
  public static toDomain(orm: StockOrmEntity): StockAggregate {
    const stockResult = StockAggregate.create(
      {
        productId: orm.productId,
        quantity: orm.quantity,
        reservedQuantity: orm.reservedQuantity,
      },
      new UniqueEntityID(orm.id),
    );
    return stockResult.getValue();
  }

  public static toOrm(domain: StockAggregate): StockOrmEntity {
    const orm = new StockOrmEntity();
    orm.id = domain.id.toString();
    orm.productId = domain.productId;
    orm.quantity = domain.quantity;
    orm.reservedQuantity = domain.reservedQuantity;
    return orm;
  }
}
