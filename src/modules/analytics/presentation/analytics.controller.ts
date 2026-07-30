import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GetDashboardSummaryQuery } from '../application/queries/get-dashboard-summary.query';
import { JwtAuthGuard } from '../../identity/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../identity/infrastructure/guards/roles.guard';
import { Roles } from '../../identity/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../identity/domain/enums/user-role.enum';

@ApiTags('Analytics & Dashboard (CQRS Read Model)')
@Controller('dashboard')
export class AnalyticsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_KEEPER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy dữ liệu tổng quan Dashboard (Dành cho Admin và Thủ kho)' })
  async getDashboardSummary() {
    return this.queryBus.execute(new GetDashboardSummaryQuery());
  }
}
