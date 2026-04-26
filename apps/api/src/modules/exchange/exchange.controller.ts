import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ExchangeService } from './exchange.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Exchange')
@Controller('exchange')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Public()
  @Get('rates')
  @ApiOperation({ summary: 'Get current exchange rates' })
  async getRates(@Query('base') base?: string) {
    return this.exchangeService.getRates(base);
  }

  @Public()
  @Get('preview')
  @ApiOperation({ summary: 'Preview currency conversion' })
  async preview(
    @Query('from') fromCurrency: string,
    @Query('to') toCurrency: string,
    @Query('amount') amount: number,
  ) {
    return this.exchangeService.preview({ fromCurrency, toCurrency, amount });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Convert currency between accounts' })
  async convert(@CurrentUser('id') userId: string, @Body() body: any) {
    return this.exchangeService.convert(userId, body);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get exchange history' })
  async getHistory(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.exchangeService.getHistory(userId, page, limit);
  }
}
