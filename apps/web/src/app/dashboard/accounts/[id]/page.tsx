'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { accountsApi } from '@/lib/api';
import { formatCurrency, formatDateTime, maskIBAN } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/ui/skeleton';
import { Wallet, ArrowLeft, CreditCard, Copy, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: account, isLoading } = useQuery({
    queryKey: ['account', id],
    queryFn: () => accountsApi.getOne(id).then(r => r.data),
    enabled: !!id,
  });

  if (isLoading) return <div className="space-y-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>;
  if (!account) return <div className="text-center py-12"><p className="text-muted-foreground">Account not found</p></div>;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/accounts"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">{account.name}</h1>
          <p className="text-muted-foreground">{account.accountNumber}</p>
        </div>
        <Badge variant={account.status === 'ACTIVE' ? 'success' : 'warning'} className="ml-auto">{account.status}</Badge>
      </div>

      {/* Balance Card */}
      <Card className="gradient-primary text-white border-0">
        <CardContent className="p-6">
          <p className="text-sm text-white/70">Available Balance</p>
          <p className="text-4xl font-bold mt-2">{formatCurrency(Number(account.balance), account.currency)}</p>
          <div className="flex items-center gap-6 mt-4 text-sm text-white/70">
            <span>{account.type}</span>
            <span>{account.currency}</span>
            {account.isDefault && <Badge className="bg-white/20 text-white border-0">Default</Badge>}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Details */}
        <Card>
          <CardHeader><CardTitle className="text-base">Account Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Account Number', value: account.accountNumber },
              { label: 'IBAN', value: account.iban || 'N/A' },
              { label: 'BIC/SWIFT', value: account.bic || 'N/A' },
              { label: 'Type', value: account.type },
              { label: 'Currency', value: account.currency },
              { label: 'Created', value: formatDateTime(account.createdAt) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium font-mono">{item.label === 'IBAN' ? maskIBAN(item.value) : item.value}</span>
                  {['Account Number', 'IBAN'].includes(item.label) && (
                    <button onClick={() => copyToClipboard(item.value, item.label)} className="text-muted-foreground hover:text-foreground"><Copy className="w-3 h-3" /></button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Linked Cards */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" /> Linked Cards</CardTitle></CardHeader>
          <CardContent>
            {account.cards?.length > 0 ? account.cards.map((card: any) => (
              <div key={card.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 mb-2">
                <CreditCard className="w-5 h-5 text-indigo-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">•••• {card.last4}</p>
                  <p className="text-xs text-muted-foreground">{card.brand}</p>
                </div>
                <Badge variant={card.status === 'ACTIVE' ? 'success' : 'warning'} className="text-[10px]">{card.status}</Badge>
              </div>
            )) : <p className="text-sm text-muted-foreground text-center py-4">No linked cards</p>}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/transfers" className="block"><Button variant="outline" className="w-full justify-start"><ArrowUpRight className="w-4 h-4 mr-2" /> Send Money</Button></Link>
            <Link href="/dashboard/operations" className="block"><Button variant="outline" className="w-full justify-start"><ArrowDownLeft className="w-4 h-4 mr-2" /> Deposit</Button></Link>
            <Link href="/dashboard/exchange" className="block"><Button variant="outline" className="w-full justify-start"><Wallet className="w-4 h-4 mr-2" /> Exchange</Button></Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <Link href="/dashboard/transactions" className="text-sm text-primary hover:underline">View all</Link>
          </div>
        </CardHeader>
        <CardContent>
          {account.transactions?.length > 0 ? (
            <div className="space-y-2">
              {account.transactions.map((txn: any) => {
                const isIncome = ['DEPOSIT', 'TRANSFER_IN', 'REFUND'].includes(txn.type);
                return (
                  <div key={txn.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isIncome ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                      {isIncome ? <ArrowDownLeft className="w-4 h-4 text-emerald-500" /> : <ArrowUpRight className="w-4 h-4 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{txn.description || txn.type}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(txn.createdAt)}</p>
                    </div>
                    <span className={`text-sm font-semibold ${isIncome ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(Number(txn.amount), txn.currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>}
        </CardContent>
      </Card>
    </div>
  );
}
