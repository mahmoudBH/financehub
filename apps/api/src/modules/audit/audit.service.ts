// ============================================
// Audit Service - Track Sensitive Actions
// ============================================
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

interface AuditLogEntry {
  action: string;
  userId?: string;
  description?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  targetId?: string;
  targetType?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: entry.action,
          description: entry.description,
          metadata: entry.metadata ? JSON.stringify(entry.metadata) : undefined,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          userId: entry.userId,
          targetId: entry.targetId,
          targetType: entry.targetType,
        },
      });
    } catch (error: any) {
      this.logger.error(`Failed to create audit log: ${error?.message}`);
    }
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { page = 1, limit = 20, userId, action, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
