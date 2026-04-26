import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TransfersService } from './transfers.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Transfers')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transfer' })
  async create(@CurrentUser('id') userId: string, @Body() body: any) {
    return this.transfersService.create(userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transfers' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.transfersService.findAll(userId, { page, limit, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transfer details' })
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.transfersService.findOne(userId, id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a pending transfer' })
  async cancel(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.transfersService.cancel(userId, id);
  }
}
