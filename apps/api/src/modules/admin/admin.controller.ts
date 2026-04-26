import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  async getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getUsers({ page, limit, search, status });
  }

  @Patch('users/:id/freeze')
  @ApiOperation({ summary: 'Freeze/suspend a user' })
  async freezeUser(@CurrentUser('id') adminId: string, @Param('id') id: string) {
    return this.adminService.freezeUser(adminId, id);
  }

  @Patch('users/:id/unfreeze')
  @ApiOperation({ summary: 'Unfreeze/reactivate a user' })
  async unfreezeUser(@CurrentUser('id') adminId: string, @Param('id') id: string) {
    return this.adminService.unfreezeUser(adminId, id);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  async getAuditLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
  ) {
    return this.adminService.getAuditLogs({ page, limit, action, userId });
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get all transactions (admin view)' })
  async getTransactions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getTransactions({ page, limit, status });
  }
}
