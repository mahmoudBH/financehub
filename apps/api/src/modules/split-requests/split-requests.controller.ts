import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SplitRequestsService } from './split-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Split Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('split-requests')
export class SplitRequestsController {
  constructor(private readonly splitRequestsService: SplitRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a split request' })
  create(@Req() req, @Body() body: { transactionId: string; requestedFrom: string; amount: number }) {
    return this.splitRequestsService.create(req.user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all split requests for current user' })
  findAll(@Req() req) {
    return this.splitRequestsService.findAll(req.user.id);
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Mark a split request as paid' })
  markAsPaid(@Req() req, @Param('id') id: string) {
    return this.splitRequestsService.markAsPaid(req.user.id, id);
  }
}
