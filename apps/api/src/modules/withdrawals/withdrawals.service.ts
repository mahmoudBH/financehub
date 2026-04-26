// ============================================
// Withdrawals Service
// ============================================
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { nanoid } from 'nanoid';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class WithdrawalsService {
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

    const amount = new Decimal(data.amount);
    if (account.balance.lessThan(amount)) {
      throw new BadRequestException('Insufficient balance');
    }

    const reference = `WDR-${nanoid(12).toUpperCase()}`;

    const result = await this.prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawal.create({
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
      const balanceAfter = account.balance.sub(amount);

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: balanceAfter, availableBalance: balanceAfter },
      });

      await tx.transaction.create({
        data: {
          reference: `TXN-${nanoid(12).toUpperCase()}`,
          type: 'WITHDRAWAL',
          status: 'COMPLETED',
          amount,
          currency: account.currency,
          description: data.description || `Withdrawal via ${data.method || 'bank transfer'}`,
          balanceBefore,
          balanceAfter,
          userId,
          accountId: data.accountId,
          withdrawalId: withdrawal.id,
        },
      });

      return withdrawal;
    });

    await this.notificationsService.create({
      userId,
      type: 'TRANSACTION',
      title: 'Withdrawal Processed',
      message: `€${amount.toString()} has been withdrawn from your account.`,
      priority: 'MEDIUM',
    });

    await this.auditService.log({
      action: 'WITHDRAWAL',
      userId,
      targetId: result.id,
      targetType: 'Withdrawal',
      description: `Withdrawal of €${amount.toString()} (${reference})`,
    });

    return result;
  }
}
