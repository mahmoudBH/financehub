'use client';

import { useQuery } from '@tanstack/react-query';
import { accountsApi, transactionsApi, insightsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardSkeleton } from '@/components/ui/skeleton';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, TrendingDown, CreditCard, ArrowUpRight,
  ArrowDownLeft, ArrowRight, RefreshCw, Plus, PieChart,
  Target, Bell, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RechartsPie, Pie, Cell,
} from 'recharts';

const demoChartData = [
  { date: 'Mar 20', income: 4200, expenses: 2800 },
  { date: 'Mar 22', income: 5100, expenses: 3200 },
  { date: 'Mar 24', income: 4500, expenses: 2700 },
  { date: 'Mar 26', income: 6200, expenses: 2400 },
  { date: 'Mar 28', income: 4800, expenses: 2900 },
  { date: 'Mar 30', income: 5500, expenses: 3500 },
  { date: 'Apr 01', income: 7200, expenses: 2600 },
];

const demoTransactions = [
  { id: '1', type: 'DEPOSIT', description: 'Salary Deposit', amount: 3500, currency: 'EUR', createdAt: new Date(Date.now() - 86400000).toISOString(), status: 'COMPLETED' },
  { id: '2', type: 'TRANSFER_OUT', description: 'Transfer to Sophie', amount: 250, currency: 'EUR', createdAt: new Date(Date.now() - 172800000).toISOString(), status: 'COMPLETED' },
  { id: '3', type: 'WITHDRAWAL', description: 'ATM Withdrawal', amount: 100, currency: 'EUR', createdAt: new Date(Date.now() - 259200000).toISOString(), status: 'COMPLETED' },
  { id: '4', type: 'DEPOSIT', description: 'Client Payment', amount: 800, currency: 'EUR', createdAt: new Date(Date.now() - 345600000).toISOString(), status: 'COMPLETED' },
  { id: '5', type: 'TRANSFER_IN', description: 'Refund from Ahmed', amount: 150, currency: 'EUR', createdAt: new Date(Date.now() - 432000000).toISOString(), status: 'COMPLETED' },
];

const spendingData = [
  { name: 'Shopping', value: 35, color: '#6366f1' },
  { name: 'Food', value: 25, color: '#10b981' },
  { name: 'Transport', value: 20, color: '#f59e0b' },
  { name: 'Bills', value: 15, color: '#ef4444' },
  { name: 'Other', value: 5, color: '#8b5cf6' },
];

const quickActions = [
  { label: 'Send Money', icon: ArrowUpRight, href: '/dashboard/transfers', color: 'from-indigo-500 to-purple-500' },
  { label: 'Deposit', icon: ArrowDownLeft, href: '/dashboard/operations', color: 'from-emerald-500 to-teal-500' },
  { label: 'Exchange', icon: RefreshCw, href: '/dashboard/exchange', color: 'from-amber-500 to-orange-500' },
  { label: 'New Card', icon: Plus, href: '/dashboard/cards', color: 'from-pink-500 to-rose-500' },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: accountsData, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.getAll().then(r => r.data),
    retry: false,
  });

  const { data: statsData } = useQuery({
    queryKey: ['transaction-stats'],
    queryFn: () => transactionsApi.getStats('month').then(r => r.data),
    retry: false,
  });

  const { data: insightsRes } = useQuery({
    queryKey: ['insights'],
    queryFn: () => insightsApi.getInsights().then(r => r.data),
    retry: false,
  });

  const totalBalance = accountsData?.totalBalance ?? 85550.50;
  const accounts = accountsData?.accounts ?? [];
  const income = statsData?.income ?? 28700;
  const expenses = statsData?.expenses ?? 12400;
  const chartData = statsData?.chartData?.length > 0 ? statsData.chartData : demoChartData;
  const insightsData = insightsRes || { summary: 'Your food spending is 15% higher than last month' };
  const greeting = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';

  if (isLoading) return <DashboardSkeleton />;

  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Good {greeting}, {user?.firstName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here&apos;s your financial overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/transfers">
            <Button size="sm" className="btn-press gap-2">
              <ArrowUpRight className="w-4 h-4" /> Send Money
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Balance */}
        <Card className="col-span-2 lg:col-span-1 relative overflow-hidden glass-card hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/20 to-transparent rounded-bl-full" />
          <CardContent className="p-5 md:p-6 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs md:text-sm font-medium text-muted-foreground">Total Balance</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-indigo-500" />
              </div>
            </div>
            <AnimatedNumber value={totalBalance} className="text-2xl md:text-3xl font-bold" />
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-xs text-emerald-500 font-medium">+12.5%</span>
              <span className="text-xs text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Income */}
        <Card className="relative overflow-hidden glass-card hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/20 to-transparent rounded-bl-full" />
          <CardContent className="p-5 md:p-6 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs md:text-sm font-medium text-muted-foreground">Income</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <AnimatedNumber value={income} className="text-xl md:text-2xl font-bold text-emerald-500" />
            <p className="text-xs text-muted-foreground mt-2">This month</p>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card className="relative overflow-hidden glass-card hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-500/20 to-transparent rounded-bl-full" />
          <CardContent className="p-5 md:p-6 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs md:text-sm font-medium text-muted-foreground">Expenses</span>
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
            </div>
            <AnimatedNumber value={expenses} className="text-xl md:text-2xl font-bold text-red-500" />
            <p className="text-xs text-muted-foreground mt-2">This month</p>
          </CardContent>
        </Card>

        {/* Active Cards */}
        <Card className="relative overflow-hidden glass-card hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-bl-full" />
          <CardContent className="p-5 md:p-6 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs md:text-sm font-medium text-muted-foreground">Cards</span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-purple-500" />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold">2</p>
            <p className="text-xs text-muted-foreground mt-2">{accounts.length || 3} accounts</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Card className="group cursor-pointer glass-card border-transparent hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-3 md:p-4 flex flex-col items-center text-center gap-2">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-indigo-500/20`}>
                    <action.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <span className="text-[11px] md:text-xs font-medium">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg">Revenue & Expenses</CardTitle>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-muted-foreground">Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-muted-foreground">Expenses</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-56 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={50} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={2} fill="url(#incomeGrad)" />
                  <Area type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={2} fill="url(#expenseGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Spending Breakdown */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base md:text-lg">Spending Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-44 md:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={spendingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {spendingData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {spendingData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Activity + Accounts Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg">Recent Activity</CardTitle>
              <Link href="/dashboard/transactions" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {demoTransactions.map((txn, i) => {
                const isIncome = ['DEPOSIT', 'TRANSFER_IN', 'REFUND'].includes(txn.type);
                return (
                  <motion.div
                    key={txn.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isIncome ? 'bg-emerald-500/10' : 'bg-red-500/10'
                    }`}>
                      {isIncome ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{txn.description}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(txn.createdAt)}</p>
                    </div>
                    <span className={`text-sm font-semibold tabular-nums ${isIncome ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(txn.amount)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Accounts Overview */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg">Your Accounts</CardTitle>
              <Link href="/dashboard/accounts" className="text-xs text-primary hover:underline">
                Manage
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {accounts.length > 0 ? (
              <div className="space-y-3">
                {accounts.slice(0, 4).map((acc: any, i: number) => (
                  <motion.div
                    key={acc.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{acc.name}</p>
                      <p className="text-xs text-muted-foreground">{acc.type} · {acc.currency}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">{formatCurrency(Number(acc.balance), acc.currency)}</p>
                      <Badge variant={acc.status === 'ACTIVE' ? 'success' : 'warning'} className="text-[10px] mt-0.5">
                        {acc.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No accounts yet</p>
                <Link href="/dashboard/accounts">
                  <Button size="sm" variant="outline" className="mt-3">Create Account</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Financial Insights */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <Card className="glass-card border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">Savings Goal</p>
              <p className="text-xs text-muted-foreground mt-0.5">You&apos;re 68% towards your vacation fund</p>
              <div className="w-full bg-emerald-500/10 rounded-full h-1.5 mt-3">
                <motion.div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '68%' }}
                  transition={{ duration: 1, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-500">AI Financial Insight</p>
              <p className="text-xs text-muted-foreground mt-0.5">{insightsData.summary}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">3 Notifications</p>
              <p className="text-xs text-muted-foreground mt-0.5">Transfer received, card created, and more</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
