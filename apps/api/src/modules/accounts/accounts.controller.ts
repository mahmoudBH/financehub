// ============================================
// Accounts Controller
// ============================================
import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Accounts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all accounts for current user' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.accountsService.findAll(userId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get accounts summary with totals' })
  async getSummary(@CurrentUser('id') userId: string) {
    return this.accountsService.getSummary(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account details' })
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.accountsService.findOne(userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  async create(@CurrentUser('id') userId: string, @Body() body: any) {
    return this.accountsService.create(userId, body);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update account status (freeze/unfreeze/close)' })
  async updateStatus(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('status') status: any,
  ) {
    return this.accountsService.updateStatus(userId, id, status);
  }
}
