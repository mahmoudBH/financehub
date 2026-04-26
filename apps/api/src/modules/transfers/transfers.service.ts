// ============================================
// Transfers Service - Money Transfer Logic
// ============================================
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { nanoid } from 'nanoid';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TransfersService {
  private readonly logger = new Logger(TransfersService.name);
  private readonly FEE_RATE = 0.001; // 0.1% fee

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, data: {
    sourceAccountId: string;
    destinationAccountId?: string;
    beneficiaryId?: string;
    amount: number;
    currency?: string;
    description?: string;
  }) {
    // 1. Validate source account
    const sourceAccount = await this.prisma.account.findFirst({
      where: { id: data.sourceAccountId, userId, status: 'ACTIVE' },
    });

    if (!sourceAccount) {
      throw new NotFoundException('Source account not found or inactive');
    }

    // 2. Calculate fee
    const amount = new Decimal(data.amount);
    const fee = amount.mul(this.FEE_RATE).toDecimalPlaces(2);
    const totalAmount = amount.add(fee);

    // 3. Check balance
    if (sourceAccount.balance.lessThan(totalAmount)) {
      throw new BadRequestException(
        `Insufficient balance. Required: ${totalAmount.toString()}, Available: ${sourceAccount.balance.toString()}`,
      );
    }

    // 4. Generate reference
    const reference = `TRF-${nanoid(12).toUpperCase()}`;

    // 5. Execute transfer in transaction
    const transfer = await this.prisma.$transaction(async (tx) => {
      // Create transfer record
      const newTransfer = await tx.transfer.create({
        data: {
          reference,
          senderId: userId,
          sourceAccountId: data.sourceAccountId,
          destinationAccountId: data.destinationAccountId,
          beneficiaryId: data.beneficiaryId,
          amount: amount,
          currency: (data.currency as any) || sourceAccount.currency,
          fee,
          totalAmount,
          status: 'PROCESSING',
          description: data.description,
        },
      });

      // Debit source account
      const balanceBefore = sourceAccount.balance;
      const balanceAfter = sourceAccount.balance.sub(totalAmount);

      await tx.account.update({
        where: { id: data.sourceAccountId },
        data: {
          balance: balanceAfter,
          availableBalance: balanceAfter,
        },
      });

      // Create outgoing transaction record
      await tx.transaction.create({
        data: {
          reference: `TXN-${nanoid(12).toUpperCase()}`,
          type: 'TRANSFER_OUT',
          status: 'COMPLETED',
          amount: totalAmount,
          fee,
          currency: (data.currency as any) || sourceAccount.currency,
          description: data.description || `Transfer to ${data.destinationAccountId ? 'account' : 'beneficiary'}`,
          balanceBefore,
          balanceAfter,
          userId,
          accountId: data.sourceAccountId,
          transferId: newTransfer.id,
        },
      });

      // Credit destination account if internal transfer
      if (data.destinationAccountId) {
        const destAccount = await tx.account.findUnique({
          where: { id: data.destinationAccountId },
        });

        if (destAccount) {
          const destBalanceBefore = destAccount.balance;
          const destBalanceAfter = destAccount.balance.add(amount);

          await tx.account.update({
            where: { id: data.destinationAccountId },
            data: {
              balance: destBalanceAfter,
              availableBalance: destBalanceAfter,
            },
          });

          // Create incoming transaction for recipient
          await tx.transaction.create({
            data: {
              reference: `TXN-${nanoid(12).toUpperCase()}`,
              type: 'TRANSFER_IN',
              status: 'COMPLETED',
              amount,
              fee: new Decimal(0),
              currency: (data.currency as any) || sourceAccount.currency,
              description: `Transfer from ${sourceAccount.name}`,
              balanceBefore: destBalanceBefore,
              balanceAfter: destBalanceAfter,
              userId: destAccount.userId,
              accountId: data.destinationAccountId,
              transferId: newTransfer.id,
            },
          });
        }
      }

      // Fee transaction
      if (fee.greaterThan(0)) {
        await tx.transaction.create({
          data: {
            reference: `FEE-${nanoid(12).toUpperCase()}`,
            type: 'FEE',
            status: 'COMPLETED',
            amount: fee,
            currency: (data.currency as any) || sourceAccount.currency,
            description: `Transfer fee for ${reference}`,
            userId,
            accountId: data.sourceAccountId,
            transferId: newTransfer.id,
          },
        });
      }

      // Mark transfer as completed
      return tx.transfer.update({
        where: { id: newTransfer.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    });

    // 6. Notifications & audit (outside transaction)
    await this.notificationsService.create({
      userId,
      type: 'TRANSFER',
      title: 'Transfer Completed',
      message: `Your transfer of €${amount.toString()} (ref: ${reference}) has been completed successfully.`,
      priority: 'MEDIUM',
    });

    await this.auditService.log({
      action: 'TRANSFER_COMPLETE',
      userId,
      targetId: transfer.id,
      targetType: 'Transfer',
      description: `Transfer ${reference} completed: €${amount.toString()}`,
      metadata: { reference, amount: amount.toString(), fee: fee.toString() },
    });

    this.logger.log(`Transfer ${reference} completed for user ${userId}`);

    return transfer;
  }

  async findAll(userId: string, options?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const { page = 1, limit = 20, status } = options || {};
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [{ senderId: userId }, { recipientId: userId }],
    };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.transfer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sourceAccount: { select: { name: true, currency: true } },
          destinationAccount: { select: { name: true, currency: true } },
          beneficiary: { select: { name: true } },
        },
      }),
      this.prisma.transfer.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(userId: string, transferId: string) {
    const transfer = await this.prisma.transfer.findFirst({
      where: {
        id: transferId,
        OR: [{ senderId: userId }, { recipientId: userId }],
      },
      include: {
        sender: { select: { firstName: true, lastName: true, email: true } },
        recipient: { select: { firstName: true, lastName: true, email: true } },
        sourceAccount: { select: { name: true, accountNumber: true, currency: true } },
        destinationAccount: { select: { name: true, accountNumber: true, currency: true } },
        beneficiary: true,
        transactions: true,
      },
    });

    if (!transfer) throw new NotFoundException('Transfer not found');
    return transfer;
  }

  async cancel(userId: string, transferId: string) {
    const transfer = await this.prisma.transfer.findFirst({
      where: { id: transferId, senderId: userId, status: 'PENDING' },
    });

    if (!transfer) {
      throw new BadRequestException('Transfer not found or cannot be cancelled');
    }

    const updated = await this.prisma.transfer.update({
      where: { id: transferId },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });

    await this.auditService.log({
      action: 'TRANSFER_CANCEL',
      userId,
      targetId: transferId,
      targetType: 'Transfer',
      description: `Transfer ${transfer.reference} cancelled`,
    });

    return updated;
  }
}
