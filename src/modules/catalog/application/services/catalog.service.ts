import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductOrmEntity } from '../../infrastructure/persistence/product.orm-entity';
import { v4 as uuidv4 } from 'uuid';

export class CreateProductDto {
  sku: string;
  name: string;
  price: number;
  description?: string;
}

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly productRepository: Repository<ProductOrmEntity>,
  ) {}

  async createProduct(dto: CreateProductDto): Promise<ProductOrmEntity> {
    const product = this.productRepository.create({
      id: uuidv4(),
      ...dto,
    });
    return this.productRepository.save(product);
  }

  async findAll(): Promise<ProductOrmEntity[]> {
    return this.productRepository.find();
  }

  async findById(id: string): Promise<ProductOrmEntity> {
    const found = await this.productRepository.findOne({ where: { id } });
    if (!found) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return found;
  }
}
