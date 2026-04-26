// ============================================
// Transactions Service - Transaction History
// ============================================
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, options?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    accountId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, type, status, accountId, startDate, endDate, search } = options || {};
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (type) where.type = type;
    if (status) where.status = status;
    if (accountId) where.accountId = accountId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { reference: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          account: { select: { name: true, currency: true } },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(userId: string, transactionId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, userId },
      include: {
        account: { select: { name: true, accountNumber: true, currency: true } },
        transfer: { select: { reference: true, status: true } },
        deposit: { select: { reference: true, method: true } },
        withdrawal: { select: { reference: true, method: true } },
        exchange: { select: { reference: true, fromCurrency: true, toCurrency: true, rate: true } },
      },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async getStats(userId: string, period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      select: { type: true, amount: true, createdAt: true },
    });

    const income = transactions
      .filter((t) => ['DEPOSIT', 'TRANSFER_IN', 'REFUND'].includes(t.type))
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter((t) => ['WITHDRAWAL', 'TRANSFER_OUT', 'FEE', 'EXCHANGE'].includes(t.type))
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Group by day for chart data
    const dailyData: Record<string, { income: number; expenses: number }> = {};
    transactions.forEach((t) => {
      const day = t.createdAt.toISOString().split('T')[0];
      if (!dailyData[day]) dailyData[day] = { income: 0, expenses: 0 };
      const amount = Number(t.amount);
      if (['DEPOSIT', 'TRANSFER_IN', 'REFUND'].includes(t.type)) {
        dailyData[day].income += amount;
      } else {
        dailyData[day].expenses += amount;
      }
    });

    const chartData = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({ date, ...values }));

    return {
      income,
      expenses,
      net: income - expenses,
      totalTransactions: transactions.length,
      chartData,
    };
  }

  async getRecentActivity(userId: string, limit: number = 5) {
    return this.prisma.transaction.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        account: { select: { name: true, currency: true } },
      },
    });
  }

  async exportData(userId: string, options?: {
    startDate?: string;
    endDate?: string;
    format?: string;
  }) {
    const where: any = { userId };
    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) where.createdAt.gte = new Date(options.startDate);
      if (options.endDate) where.createdAt.lte = new Date(options.endDate);
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        account: { select: { name: true, currency: true } },
      },
    });

    return {
      data: transactions,
      exportedAt: new Date().toISOString(),
      totalRecords: transactions.length,
    };
  }
}
