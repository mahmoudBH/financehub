import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class SplitRequestsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(userId: string, data: { transactionId: string; requestedFrom: string; amount: number }) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: data.transactionId, userId },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');

    const splitRequest = await this.prisma.splitRequest.create({
      data: {
        transactionId: data.transactionId,
        requestedFrom: data.requestedFrom,
        amount: data.amount,
        userId,
        status: 'PENDING',
      },
    });

    await this.auditService.log({
      action: 'SPLIT_REQUEST_CREATE',
      userId,
      targetId: splitRequest.id,
      targetType: 'SplitRequest',
      description: `Created split request for ${data.requestedFrom}`,
    });

    return splitRequest;
  }

  async findAll(userId: string) {
    return this.prisma.splitRequest.findMany({
      where: { userId },
      include: {
        transaction: {
          select: { description: true, amount: true, currency: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsPaid(userId: string, id: string) {
    const splitRequest = await this.prisma.splitRequest.findFirst({
      where: { id, userId },
    });

    if (!splitRequest) throw new NotFoundException('Split request not found');

    const updated = await this.prisma.splitRequest.update({
      where: { id },
      data: { status: 'PAID' },
    });

    await this.auditService.log({
      action: 'SPLIT_REQUEST_PAID',
      userId,
      targetId: updated.id,
      targetType: 'SplitRequest',
      description: `Split request from ${updated.requestedFrom} marked as paid`,
    });

    return updated;
  }
}
