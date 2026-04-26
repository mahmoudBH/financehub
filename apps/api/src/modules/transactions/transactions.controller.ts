import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Transactions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get transaction history with filters' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: any,
    @Query('status') status?: any,
    @Query('accountId') accountId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.transactionsService.findAll(userId, {
      page, limit, type, status, accountId, startDate, endDate, search,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get transaction statistics' })
  async getStats(
    @CurrentUser('id') userId: string,
    @Query('period') period?: 'week' | 'month' | 'year',
  ) {
    return this.transactionsService.getStats(userId, period);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent activity' })
  async getRecent(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.transactionsService.getRecentActivity(userId, limit);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export transactions' })
  async exportData(
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionsService.exportData(userId, { startDate, endDate });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction details' })
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.transactionsService.findOne(userId, id);
  }
}
