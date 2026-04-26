// ============================================
// Deposits Service
// ============================================
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { nanoid } from 'nanoid';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DepositsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, data: {
    accountId: string;
    amount: number;
    method?: string;
    description?: string;
  }) {
    const account = await this.prisma.account.findFirst({
      where: { id: data.accountId, userId, status: 'ACTIVE' },
    });

    if (!account) throw new NotFoundException('Account not found or inactive');
    if (data.amount <= 0) throw new BadRequestException('Amount must be positive');
    if (data.amount > 100000) throw new BadRequestException('Maximum deposit is €100,000');

    const reference = `DEP-${nanoid(12).toUpperCase()}`;
    const amount = new Decimal(data.amount);

    const result = await this.prisma.$transaction(async (tx) => {
      const deposit = await tx.deposit.create({
        data: {
          reference,
          amount,
          currency: account.currency,
          method: (data.method as any) || 'BANK_TRANSFER',
          status: 'COMPLETED',
          description: data.description,
          userId,
          accountId: data.accountId,
          completedAt: new Date(),
        },
      });

      const balanceBefore = account.balance;
      const balanceAfter = account.balance.add(amount);

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: balanceAfter, availableBalance: balanceAfter },
      });

      await tx.transaction.create({
        data: {
          reference: `TXN-${nanoid(12).toUpperCase()}`,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          amount,
          currency: account.currency,
          description: data.description || `Deposit via ${data.method || 'bank transfer'}`,
          balanceBefore,
          balanceAfter,
          userId,
          accountId: data.accountId,
          depositId: deposit.id,
        },
      });

      return deposit;
    });

    await this.notificationsService.create({
      userId,
      type: 'TRANSACTION',
      title: 'Deposit Received',
      message: `€${amount.toString()} has been deposited to your account.`,
      priority: 'MEDIUM',
    });

    await this.auditService.log({
      action: 'DEPOSIT',
      userId,
      targetId: result.id,
      targetType: 'Deposit',
      description: `Deposit of €${amount.toString()} (${reference})`,
    });

    return result;
  }
}
