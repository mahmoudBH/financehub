// ============================================
// Users Controller
// ============================================
import { Controller, Get, Patch, Body, UseGuards, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update profile information' })
  async updateProfile(@CurrentUser('id') userId: string, @Body() body: any) {
    return this.usersService.updateProfile(userId, body);
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(userId, body.currentPassword, body.newPassword);
  }

  @Patch('me/settings')
  @ApiOperation({ summary: 'Update user settings' })
  async updateSettings(@CurrentUser('id') userId: string, @Body() body: any) {
    return this.usersService.updateSettings(userId, body);
  }

  @Get('me/security-logs')
  @ApiOperation({ summary: 'Get recent security logs' })
  async getSecurityLogs(@CurrentUser('id') userId: string) {
    return this.usersService.getSecurityLogs(userId);
  }

  @Get('me/sessions')
  @ApiOperation({ summary: 'Get active sessions' })
  async getActiveSessions(@CurrentUser('id') userId: string) {
    return this.usersService.getActiveSessions(userId);
  }

  @Delete('me/sessions/:id')
  @ApiOperation({ summary: 'Revoke a session' })
  async revokeSession(@CurrentUser('id') userId: string, @Param('id') sessionId: string) {
    return this.usersService.revokeSession(userId, sessionId);
  }
}
