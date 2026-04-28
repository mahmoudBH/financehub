// ============================================
// Users Service
// ============================================
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        dateOfBirth: true,
        address: true,
        city: true,
        country: true,
        postalCode: true,
        role: true,
        status: true,
        emailVerified: true,
        twoFactorEnabled: true,
        kycStatus: true,
        preferredCurrency: true,
        language: true,
        timezone: true,
        tier: true,
        cashbackPoints: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: any) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        address: data.address,
        city: data.city,
        country: data.country,
        postalCode: data.postalCode,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        city: true,
        country: true,
        postalCode: true,
      },
    });

    await this.auditService.log({
      action: 'PROFILE_UPDATE',
      userId,
      description: 'Profile information updated',
    });

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new BadRequestException('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revoke all refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.auditService.log({
      action: 'PASSWORD_CHANGE',
      userId,
      description: 'Password changed',
    });

    return { message: 'Password changed successfully' };
  }

  async updateSettings(userId: string, settings: any) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        preferredCurrency: settings.preferredCurrency,
        language: settings.language,
        timezone: settings.timezone,
        twoFactorEnabled: settings.twoFactorEnabled,
      },
      select: {
        preferredCurrency: true,
        language: true,
        timezone: true,
        twoFactorEnabled: true,
      },
    });

    await this.auditService.log({
      action: 'SETTINGS_UPDATE',
      userId,
      description: 'User settings updated',
    });

    return user;
  }

  async getSecurityLogs(userId: string) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async getActiveSessions(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.refreshToken.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.refreshToken.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    await this.auditService.log({
      action: 'SESSION_REVOKED',
      userId,
      description: `Revoked session from IP: ${session.ipAddress || 'unknown'}`,
    });

    return { success: true };
  }
}
