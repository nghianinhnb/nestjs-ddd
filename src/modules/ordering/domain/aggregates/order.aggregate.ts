import { AggregateRoot } from '../../../../shared/domain/aggregate-root.base';
import { UniqueEntityID } from '../../../../shared/domain/unique-entity-id';
import { Result } from '../../../../shared/domain/result';
import { OrderItem } from '../value-objects/order-item.vo';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderCreatedEvent } from '../events/order-created.event';
import { OrderPlacedIntegrationEvent } from '../events/order-placed.integration-event';
import { OrderCancelledEvent } from '../events/order-cancelled.event';
import { OrderApprovedEvent } from '../events/order-approved.event';

export interface OrderProps {
  customerId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  cancellationReason?: string;
  createdAt?: Date;
}

export class OrderAggregate extends AggregateRoot<OrderProps> {
  private constructor(props: OrderProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get items(): OrderItem[] {
    return this.props.items;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get totalAmount(): number {
    return this.props.totalAmount;
  }

  get cancellationReason(): string {
    return this.props.cancellationReason || '';
  }

  get createdAt(): Date {
    return this.props.createdAt || new Date();
  }

  public placeOrder(): Result<void> {
    if (this.props.status !== OrderStatus.DRAFT) {
      return Result.fail<void>('Order can only be placed when in DRAFT status');
    }

    this.props.status = OrderStatus.PLACED;
    const itemDtos = this.props.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    }));

    this.addDomainEvent(new OrderCreatedEvent(this.id, this.customerId, this.totalAmount));
    this.addDomainEvent(
      new OrderPlacedIntegrationEvent(this.id.toString(), this.customerId, this.totalAmount, itemDtos),
    );
    return Result.ok();
  }

  public approveOrder(): Result<void> {
    if (this.props.status === OrderStatus.CANCELLED) {
      return Result.fail<void>('Cannot approve a cancelled order');
    }
    this.props.status = OrderStatus.APPROVED;
    this.addDomainEvent(new OrderApprovedEvent(this.id));
    return Result.ok();
  }

  public cancelOrder(reason: string): Result<void> {
    if (this.props.status === OrderStatus.APPROVED) {
      return Result.fail<void>('Cannot cancel an already approved order');
    }
    this.props.status = OrderStatus.CANCELLED;
    this.props.cancellationReason = reason;
    this.addDomainEvent(new OrderCancelledEvent(this.id, reason));
    return Result.ok();
  }

  public static create(props: Omit<OrderProps, 'status' | 'totalAmount'> & { status?: OrderStatus }, id?: UniqueEntityID): Result<OrderAggregate> {
    if (!props.customerId) {
      return Result.fail<OrderAggregate>('Customer ID is required');
    }
    if (!props.items || props.items.length === 0) {
      return Result.fail<OrderAggregate>('Order must contain at least one line item');
    }

    const totalAmount = props.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const order = new OrderAggregate(
      {
        ...props,
        status: props.status || OrderStatus.DRAFT,
        totalAmount,
        createdAt: props.createdAt || new Date(),
      },
      id,
    );

    return Result.ok<OrderAggregate>(order);
  }
}
