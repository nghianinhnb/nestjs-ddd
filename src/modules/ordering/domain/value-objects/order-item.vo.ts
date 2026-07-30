import { ValueObject } from '../../../../shared/domain/value-object.base';
import { Result } from '../../../../shared/domain/result';

interface OrderItemProps {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export class OrderItem extends ValueObject<OrderItemProps> {
  private constructor(props: OrderItemProps) {
    super(props);
  }

  get productId(): string {
    return this.props.productId;
  }

  get productName(): string {
    return this.props.productName;
  }

  get unitPrice(): number {
    return this.props.unitPrice;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get totalPrice(): number {
    return this.props.unitPrice * this.props.quantity;
  }

  public static create(props: OrderItemProps): Result<OrderItem> {
    if (!props.productId) {
      return Result.fail<OrderItem>('Product ID is required');
    }
    if (props.quantity <= 0) {
      return Result.fail<OrderItem>('Quantity must be greater than zero');
    }
    if (props.unitPrice < 0) {
      return Result.fail<OrderItem>('Unit price cannot be negative');
    }

    return Result.ok<OrderItem>(new OrderItem(props));
  }
}
