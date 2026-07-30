import { OrderOrmEntity } from './order.orm-entity';
import { OrderItemOrmEntity } from './order-item.orm-entity';
import { OrderAggregate } from '../../domain/aggregates/order.aggregate';
import { OrderItem } from '../../domain/value-objects/order-item.vo';
import { UniqueEntityID } from '../../../../shared/domain/unique-entity-id';

export class OrderMapper {
  public static toDomain(orm: OrderOrmEntity): OrderAggregate {
    const items = (orm.items || []).map((item) =>
      OrderItem.create({
        productId: item.productId,
        productName: item.productName,
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
      }).getValue(),
    );

    const orderResult = OrderAggregate.create(
      {
        customerId: orm.customerId,
        items,
        status: orm.status,
        cancellationReason: orm.cancellationReason,
        createdAt: orm.createdAt,
      },
      new UniqueEntityID(orm.id),
    );

    return orderResult.getValue();
  }

  public static toOrm(domain: OrderAggregate): OrderOrmEntity {
    const orm = new OrderOrmEntity();
    orm.id = domain.id.toString();
    orm.customerId = domain.customerId;
    orm.status = domain.status;
    orm.totalAmount = domain.totalAmount;
    orm.cancellationReason = domain.cancellationReason;
    orm.createdAt = domain.createdAt;

    orm.items = domain.items.map((item) => {
      const itemOrm = new OrderItemOrmEntity();
      itemOrm.productId = item.productId;
      itemOrm.productName = item.productName;
      itemOrm.unitPrice = item.unitPrice;
      itemOrm.quantity = item.quantity;
      itemOrm.order = orm;
      return itemOrm;
    });

    return orm;
  }
}
