// ============================================
// Admin Service - Administration & Supervision
// ============================================
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getUsers(options?: { page?: number; limit?: number; search?: string; status?: string }) {
    const { page = 1, limit = 20, search, status } = options || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, status: true, emailVerified: true, kycStatus: true,
          lastLoginAt: true, createdAt: true,
          _count: { select: { accounts: true, cards: true, sentTransfers: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async freezeUser(adminId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'SUSPENDED' },
    });

    // Freeze all accounts
    await this.prisma.account.updateMany({
      where: { userId },
      data: { status: 'FROZEN' },
    });

    await this.auditService.log({
      action: 'ADMIN_USER_FREEZE',
      userId: adminId,
      targetId: userId,
      targetType: 'User',
      description: `Admin froze user: ${user.email}`,
    });

    return { message: `User ${user.email} has been suspended` };
  }

  async unfreezeUser(adminId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
    });

    await this.prisma.account.updateMany({
      where: { userId, status: 'FROZEN' },
      data: { status: 'ACTIVE' },
    });

    await this.auditService.log({
      action: 'ADMIN_USER_UNFREEZE',
      userId: adminId,
      targetId: userId,
      targetType: 'User',
      description: `Admin unfroze user: ${user.email}`,
    });

    return { message: `User ${user.email} has been reactivated` };
  }

  async getAuditLogs(options?: { page?: number; limit?: number; action?: string; userId?: string }) {
    return this.auditService.findAll({
      page: options?.page,
      limit: options?.limit,
      action: options?.action as any,
      userId: options?.userId,
    });
  }

  async getTransactions(options?: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = options || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          account: { select: { name: true, currency: true } },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getDashboardStats() {
    const [totalUsers, activeUsers, totalAccounts, totalTransactions, totalTransfers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.account.count(),
      this.prisma.transaction.count(),
      this.prisma.transfer.count(),
    ]);

    const recentActivity = await this.prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
      },
    });

    return {
      totalUsers, activeUsers, totalAccounts, totalTransactions, totalTransfers,
      suspendedUsers: totalUsers - activeUsers,
      recentActivity,
    };
  }
}
