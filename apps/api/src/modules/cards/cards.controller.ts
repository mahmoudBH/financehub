import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Cards')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cards' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.cardsService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new virtual card' })
  async create(@CurrentUser('id') userId: string, @Body() body: any) {
    return this.cardsService.create(userId, body);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update card status (activate/block)' })
  async updateStatus(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('status') status: any,
  ) {
    return this.cardsService.updateStatus(userId, id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a card' })
  async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.cardsService.delete(userId, id);
  }
}
