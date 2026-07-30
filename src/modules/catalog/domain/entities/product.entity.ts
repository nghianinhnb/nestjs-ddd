import { Entity } from '../../../../shared/domain/entity.base';
import { UniqueEntityID } from '../../../../shared/domain/unique-entity-id';

export interface ProductProps {
  sku: string;
  name: string;
  price: number;
  description?: string;
}

export class ProductEntity extends Entity<ProductProps> {
  private constructor(props: ProductProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get sku(): string {
    return this.props.sku;
  }

  get name(): string {
    return this.props.name;
  }

  get price(): number {
    return this.props.price;
  }

  get description(): string {
    return this.props.description || '';
  }

  public static create(props: ProductProps, id?: UniqueEntityID): ProductEntity {
    return new ProductEntity(props, id);
  }
}
