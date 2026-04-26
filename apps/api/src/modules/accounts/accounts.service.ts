// ============================================
// Accounts Service - Bank Account Management
// ============================================
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';


@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(userId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { transactions: true, cards: true } },
      },
    });

    // Calculate total balance across all accounts
    const totalBalance = accounts.reduce(
      (sum, acc) => sum + Number(acc.balance),
      0,
    );

    return { accounts, totalBalance };
  }

  async findOne(userId: string, accountId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, userId },
      include: {
        cards: { select: { id: true, last4: true, brand: true, status: true } },
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            status: true,
            amount: true,
            currency: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async create(userId: string, data: {
    name: string;
    type?: string;
    currency?: string;
  }) {
    const accountCount = await this.prisma.account.count({ where: { userId } });
    if (accountCount >= 5) {
      throw new BadRequestException('Maximum 5 accounts allowed');
    }

    const accountNumber = `FH${Date.now().toString().slice(-10)}`;
    const iban = `FR${Math.floor(Math.random() * 100).toString().padStart(2, '0')}${Array.from({ length: 23 }, () => Math.floor(Math.random() * 10)).join('')}`;

    const account = await this.prisma.account.create({
      data: {
        accountNumber,
        name: data.name,
        type: data.type || 'CHECKING',
        currency: data.currency || 'EUR',
        balance: 0,
        availableBalance: 0,
        userId,
        iban,
        bic: 'FNHBFRPP',
      },
    });

    await this.auditService.log({
      action: 'ACCOUNT_CREATE',
      userId,
      targetId: account.id,
      targetType: 'Account',
      description: `Created ${data.type || 'CHECKING'} account: ${account.name}`,
    });

    return account;
  }

  async updateStatus(userId: string, accountId: string, status: string) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) throw new NotFoundException('Account not found');
    if (account.isDefault && status === 'CLOSED') {
      throw new BadRequestException('Cannot close default account');
    }

    const updated = await this.prisma.account.update({
      where: { id: accountId },
      data: { status },
    });

    const actionMap: Record<string, any> = {
      FROZEN: 'ACCOUNT_FREEZE',
      ACTIVE: 'ACCOUNT_UNFREEZE',
      CLOSED: 'ACCOUNT_CLOSE',
    };

    await this.auditService.log({
      action: actionMap[status] || 'ACCOUNT_UNFREEZE',
      userId,
      targetId: accountId,
      targetType: 'Account',
      description: `Account status changed to ${status}`,
    });

    return updated;
  }

  async getSummary(userId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { userId, status: 'ACTIVE' },
    });

    const summary = {
      totalBalance: 0,
      totalAccounts: accounts.length,
      byCurrency: {} as Record<string, number>,
      byType: {} as Record<string, number>,
    };

    accounts.forEach((acc) => {
      const balance = Number(acc.balance);
      summary.totalBalance += balance;
      summary.byCurrency[acc.currency] = (summary.byCurrency[acc.currency] || 0) + balance;
      summary.byType[acc.type] = (summary.byType[acc.type] || 0) + balance;
    });

    return summary;
  }
}
