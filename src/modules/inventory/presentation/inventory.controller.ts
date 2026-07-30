import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddStockCommand } from '../application/commands/add-stock.command';
import { GetStockByProductQuery } from '../application/queries/get-stock.query';
import { JwtAuthGuard } from '../../identity/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../identity/infrastructure/guards/roles.guard';
import { Roles } from '../../identity/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../identity/domain/enums/user-role.enum';

class AddStockDto {
  productId: string;
  quantity: number;
}

@ApiTags('Inventory (CQRS & Stock Invariants)')
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('add-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WAREHOUSE_KEEPER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Nhập kho sản phẩm (Dành cho Thủ kho và Admin)' })
  async addStock(@Body() dto: AddStockDto) {
    return this.commandBus.execute(new AddStockCommand(dto.productId, dto.quantity));
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Xem số lượng tồn kho theo Product ID' })
  async getStockByProduct(@Param('productId') productId: string) {
    return this.queryBus.execute(new GetStockByProductQuery(productId));
  }
}
