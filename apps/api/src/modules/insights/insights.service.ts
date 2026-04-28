import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class InsightsService {
  constructor(private prisma: PrismaService) {}

  async getInsights(userId: string) {
    // Get transactions from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
        status: 'COMPLETED',
      },
    });

    if (transactions.length === 0) {
      return {
        summary: "Not enough data yet. Keep using your account to generate AI insights.",
        metrics: [],
      };
    }

    const totalSpent = transactions
      .filter((t) => t.type === 'WITHDRAWAL' || t.type === 'TRANSFER_OUT' || t.type === 'FEE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalIncome = transactions
      .filter((t) => t.type === 'DEPOSIT' || t.type === 'TRANSFER_IN' || t.type === 'REFUND')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    let summary = `You spent ${totalSpent.toFixed(2)} and received ${totalIncome.toFixed(2)} in the last 30 days. `;
    if (totalSpent > totalIncome) {
      summary += "Watch out, your expenses are higher than your income this month.";
    } else {
      summary += "Great job keeping your expenses below your income!";
    }

    // Mock category analysis since we don't have categories in schema
    // We will generate some mock insight
    return {
      summary,
      metrics: [
        { label: 'Total Spent', value: totalSpent },
        { label: 'Total Income', value: totalIncome },
        { label: 'Top Expense', value: 'Dining (Mocked)', percentage: 35 },
      ],
      chartData: this.generateMockChartData(transactions),
    };
  }

  private generateMockChartData(transactions: any[]) {
    // Generate an array of 30 days showing spending intensity
    const data: { date: string; amount: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      const dayStr = d.toISOString().split('T')[0];
      const dayTransactions = transactions.filter(t => t.createdAt.toISOString().split('T')[0] === dayStr);
      const spent = dayTransactions
        .filter((t) => t.type === 'WITHDRAWAL' || t.type === 'TRANSFER_OUT' || t.type === 'FEE')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      data.push({
        date: dayStr,
        amount: spent || Math.random() * 50, // mock some baseline activity
      });
    }
    return data;
  }
}
