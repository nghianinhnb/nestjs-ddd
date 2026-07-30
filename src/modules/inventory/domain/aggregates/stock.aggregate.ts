import { AggregateRoot } from '../../../../shared/domain/aggregate-root.base';
import { UniqueEntityID } from '../../../../shared/domain/unique-entity-id';
import { Result } from '../../../../shared/domain/result';
import { StockReservedEvent } from '../events/stock-reserved.event';
import { StockReservationFailedEvent } from '../events/stock-reservation-failed.event';
import { StockReleasedEvent } from '../events/stock-released.event';

export interface StockProps {
  productId: string;
  quantity: number;
  reservedQuantity: number;
}

export class StockAggregate extends AggregateRoot<StockProps> {
  private constructor(props: StockProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get productId(): string {
    return this.props.productId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get reservedQuantity(): number {
    return this.props.reservedQuantity;
  }

  get availableQuantity(): number {
    return this.props.quantity - this.props.reservedQuantity;
  }

  public addStock(amount: number): Result<void> {
    if (amount <= 0) {
      return Result.fail<void>('Amount to add must be greater than zero');
    }
    this.props.quantity += amount;
    return Result.ok();
  }

  public reserveStock(orderId: string, qty: number): Result<void> {
    if (qty <= 0) {
      return Result.fail<void>('Reserve quantity must be positive');
    }

    if (this.availableQuantity < qty) {
      const reason = `Insufficient stock for product ${this.productId}. Requested: ${qty}, Available: ${this.availableQuantity}`;
      this.addDomainEvent(new StockReservationFailedEvent(orderId, this.productId, qty, reason));
      return Result.fail<void>(reason);
    }

    this.props.reservedQuantity += qty;
    this.addDomainEvent(new StockReservedEvent(this.id, orderId, this.productId, qty));
    return Result.ok();
  }

  public releaseStock(orderId: string, qty: number): Result<void> {
    if (qty <= 0) {
      return Result.fail<void>('Release quantity must be positive');
    }

    this.props.reservedQuantity = Math.max(0, this.props.reservedQuantity - qty);
    this.addDomainEvent(new StockReleasedEvent(this.id, orderId, this.productId, qty));
    return Result.ok();
  }

  public commitStock(qty: number): Result<void> {
    if (this.props.reservedQuantity < qty) {
      return Result.fail<void>('Cannot commit more stock than reserved');
    }
    this.props.reservedQuantity -= qty;
    this.props.quantity -= qty;
    return Result.ok();
  }

  public static create(props: StockProps, id?: UniqueEntityID): Result<StockAggregate> {
    if (!props.productId) {
      return Result.fail<StockAggregate>('Product ID is required');
    }
    if (props.quantity < 0 || props.reservedQuantity < 0) {
      return Result.fail<StockAggregate>('Stock quantities cannot be negative');
    }

    return Result.ok<StockAggregate>(
      new StockAggregate(
        {
          productId: props.productId,
          quantity: props.quantity,
          reservedQuantity: props.reservedQuantity || 0,
        },
        id,
      ),
    );
  }
}
