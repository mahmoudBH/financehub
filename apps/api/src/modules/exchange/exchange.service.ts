// ============================================
// Exchange Service - Currency Conversion
// ============================================
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { nanoid } from 'nanoid';
import { Decimal } from '@prisma/client/runtime/library';

// Simulated exchange rates
const SIMULATED_RATES: Record<string, Record<string, number>> = {
  EUR: { USD: 1.0850, GBP: 0.8560, CHF: 0.9420, JPY: 163.50, CAD: 1.4720, AUD: 1.6530, MAD: 10.85 },
  USD: { EUR: 0.9217, GBP: 0.7890, CHF: 0.8685, JPY: 150.70, CAD: 1.3570, AUD: 1.5240, MAD: 10.01 },
  GBP: { EUR: 1.1682, USD: 1.2674, CHF: 1.1005, JPY: 191.00, CAD: 1.7200, AUD: 1.9310, MAD: 12.68 },
  CHF: { EUR: 1.0616, USD: 1.1514, GBP: 0.9087, JPY: 173.56, CAD: 1.5630, AUD: 1.7550, MAD: 11.52 },
  JPY: { EUR: 0.006116, USD: 0.006636, GBP: 0.005236, CHF: 0.005764, CAD: 0.009008, AUD: 0.01012, MAD: 0.0664 },
  CAD: { EUR: 0.6793, USD: 0.7369, GBP: 0.5814, CHF: 0.6398, JPY: 111.03, AUD: 1.1230, MAD: 7.37 },
  AUD: { EUR: 0.6050, USD: 0.6562, GBP: 0.5179, CHF: 0.5698, JPY: 98.87, CAD: 0.8905, MAD: 6.57 },
  MAD: { EUR: 0.0922, USD: 0.0999, GBP: 0.0789, CHF: 0.0868, JPY: 15.07, CAD: 0.1357, AUD: 0.1524 },
};

@Injectable()
export class ExchangeService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
  ) {}

  async getRates(baseCurrency?: string) {
    const base = baseCurrency || 'EUR';
    const rates = SIMULATED_RATES[base];
    if (!rates) throw new NotFoundException('Currency not supported');

    // Add some random variation to simulate live rates
    const liveRates: Record<string, number> = {};
    for (const [currency, rate] of Object.entries(rates)) {
      const variation = 1 + (Math.random() - 0.5) * 0.002; // ±0.1% variation
      liveRates[currency] = Number((rate * variation).toFixed(6));
    }

    return {
      base,
      rates: liveRates,
      timestamp: new Date().toISOString(),
    };
  }

  async preview(data: { fromCurrency: string; toCurrency: string; amount: number }) {
    const rates = SIMULATED_RATES[data.fromCurrency];
    if (!rates || !rates[data.toCurrency]) {
      throw new BadRequestException('Currency pair not supported');
    }

    const rate = rates[data.toCurrency];
    const spread = 0.005; // 0.5% spread
    const effectiveRate = rate * (1 - spread);
    const convertedAmount = Number((data.amount * effectiveRate).toFixed(2));
    const fee = Number((data.amount * spread).toFixed(2));

    return {
      fromCurrency: data.fromCurrency,
      toCurrency: data.toCurrency,
      fromAmount: data.amount,
      toAmount: convertedAmount,
      rate: Number(rate.toFixed(6)),
      effectiveRate: Number(effectiveRate.toFixed(6)),
      fee,
      spread: `${(spread * 100).toFixed(1)}%`,
    };
  }

  async convert(userId: string, data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
  }) {
    const fromAccount = await this.prisma.account.findFirst({
      where: { id: data.fromAccountId, userId, status: 'ACTIVE' },
    });
    const toAccount = await this.prisma.account.findFirst({
      where: { id: data.toAccountId, userId, status: 'ACTIVE' },
    });

    if (!fromAccount) throw new NotFoundException('Source account not found');
    if (!toAccount) throw new NotFoundException('Destination account not found');
    if (fromAccount.currency === toAccount.currency) {
      throw new BadRequestException('Cannot convert between same currency');
    }

    const amount = new Decimal(data.amount);
    if (fromAccount.balance.lessThan(amount)) {
      throw new BadRequestException('Insufficient balance');
    }

    const rates = SIMULATED_RATES[fromAccount.currency];
    if (!rates || !rates[toAccount.currency]) {
      throw new BadRequestException('Currency pair not supported');
    }

    const rate = rates[toAccount.currency];
    const spread = 0.005;
    const effectiveRate = rate * (1 - spread);
    const convertedAmount = new Decimal(Number((data.amount * effectiveRate).toFixed(2)));
    const fee = new Decimal(Number((data.amount * spread).toFixed(2)));
    const reference = `EXC-${nanoid(12).toUpperCase()}`;

    const result = await this.prisma.$transaction(async (tx) => {
      // Create exchange record
      const exchange = await tx.exchangeHistory.create({
        data: {
          reference,
          fromCurrency: fromAccount.currency,
          toCurrency: toAccount.currency,
          fromAmount: amount,
          toAmount: convertedAmount,
          rate: new Decimal(effectiveRate),
          fee,
          status: 'COMPLETED',
          userId,
          fromAccountId: data.fromAccountId,
          toAccountId: data.toAccountId,
          completedAt: new Date(),
        },
      });

      // Debit source
      const fromBalanceBefore = fromAccount.balance;
      const fromBalanceAfter = fromAccount.balance.sub(amount);
      await tx.account.update({
        where: { id: data.fromAccountId },
        data: { balance: fromBalanceAfter, availableBalance: fromBalanceAfter },
      });

      // Credit destination
      const toBalanceBefore = toAccount.balance;
      const toBalanceAfter = toAccount.balance.add(convertedAmount);
      await tx.account.update({
        where: { id: data.toAccountId },
        data: { balance: toBalanceAfter, availableBalance: toBalanceAfter },
      });

      // Transaction records
      await tx.transaction.create({
        data: {
          reference: `TXN-${nanoid(12).toUpperCase()}`,
          type: 'EXCHANGE',
          status: 'COMPLETED',
          amount,
          fee,
          currency: fromAccount.currency,
          description: `Exchange ${fromAccount.currency} → ${toAccount.currency}`,
          balanceBefore: fromBalanceBefore,
          balanceAfter: fromBalanceAfter,
          userId,
          accountId: data.fromAccountId,
          exchangeId: exchange.id,
        },
      });

      await tx.transaction.create({
        data: {
          reference: `TXN-${nanoid(12).toUpperCase()}`,
          type: 'EXCHANGE',
          status: 'COMPLETED',
          amount: convertedAmount,
          currency: toAccount.currency,
          description: `Exchange ${fromAccount.currency} → ${toAccount.currency}`,
          balanceBefore: toBalanceBefore,
          balanceAfter: toBalanceAfter,
          userId,
          accountId: data.toAccountId,
          exchangeId: exchange.id,
        },
      });

      return exchange;
    });

    await this.notificationsService.create({
      userId,
      type: 'TRANSACTION',
      title: 'Exchange Completed',
      message: `Converted ${amount} ${fromAccount.currency} → ${convertedAmount} ${toAccount.currency}`,
      priority: 'MEDIUM',
    });

    await this.auditService.log({
      action: 'EXCHANGE',
      userId,
      targetId: result.id,
      targetType: 'Exchange',
      description: `Exchange ${reference}: ${amount} ${fromAccount.currency} → ${convertedAmount} ${toAccount.currency}`,
    });

    return result;
  }

  async getHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.exchangeHistory.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.exchangeHistory.count({ where: { userId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
