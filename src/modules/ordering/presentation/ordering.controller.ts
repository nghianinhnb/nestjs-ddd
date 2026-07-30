import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateOrderCommand } from '../application/commands/create-order.command';
import { GetOrderByIdQuery, GetCustomerOrdersQuery } from '../application/queries/get-order-by-id.query';
import { JwtAuthGuard } from '../../identity/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../identity/infrastructure/decorators/current-user.decorator';

class CreateOrderRequestDto {
  items: { productId: string; productName: string; unitPrice: number; quantity: number }[];
}

@ApiTags('Ordering (Complex CQRS & Aggregates)')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng mới (Khách hàng tạo đơn)' })
  async createOrder(@CurrentUser('userId') customerId: string, @Body() dto: CreateOrderRequestDto) {
    return this.commandBus.execute(new CreateOrderCommand(customerId, dto.items));
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Xem các đơn hàng của chính mình' })
  async getMyOrders(@CurrentUser('userId') customerId: string) {
    return this.queryBus.execute(new GetCustomerOrdersQuery(customerId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết đơn hàng theo ID' })
  async getOrderById(@Param('id') id: string) {
    return this.queryBus.execute(new GetOrderByIdQuery(id));
  }
}
