'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/ui/skeleton';
import { Wallet, Plus, ArrowRight, Lock, Unlock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useState } from 'react';

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', type: 'CHECKING', currency: 'EUR' });

  const { data, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.getAll().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => accountsApi.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['accounts'] }); toast.success('Account created'); setShowCreate(false); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => accountsApi.updateStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['accounts'] }); toast.success('Status updated'); },
  });

  const accounts = data?.accounts || [];
  const totalBalance = data?.totalBalance || 0;

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage your bank accounts</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}><Plus className="w-4 h-4 mr-2" /> New Account</Button>
      </div>

      <Card className="gradient-primary text-white border-0">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70">Total Balance</p>
            <p className="text-4xl font-bold mt-2">{formatCurrency(totalBalance)}</p>
            <p className="text-sm text-white/70 mt-2">{accounts.length} accounts</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
            <Wallet className="w-8 h-8 text-white" />
          </div>
        </CardContent>
      </Card>

      {showCreate && (
        <Card className="border-primary/30">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Create New Account</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Account name" value={newAccount.name} onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })} className="h-10 rounded-lg border border-input bg-background px-3 text-sm" />
              <select value={newAccount.type} onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                <option value="CHECKING">Checking</option><option value="SAVINGS">Savings</option><option value="BUSINESS">Business</option>
              </select>
              <select value={newAccount.currency} onChange={(e) => setNewAccount({ ...newAccount, currency: e.target.value })} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                <option value="EUR">EUR</option><option value="USD">USD</option><option value="GBP">GBP</option><option value="MAD">MAD</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => createMutation.mutate(newAccount)} loading={createMutation.isPending}>Create</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : accounts.length === 0 ? (
        <Card><CardContent className="p-12 text-center">
          <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
          <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" /> Create Account</Button>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc: any) => (
            <Card key={acc.id} className="group hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center"><Wallet className="w-5 h-5 text-indigo-500" /></div>
                    <div><p className="font-semibold">{acc.name}</p><p className="text-xs text-muted-foreground">{acc.accountNumber}</p></div>
                  </div>
                  <Badge variant={acc.status === 'ACTIVE' ? 'success' : 'warning'}>{acc.status}</Badge>
                </div>
                <p className="text-2xl font-bold mb-1">{formatCurrency(Number(acc.balance), acc.currency)}</p>
                <p className="text-xs text-muted-foreground mb-4">{acc.type} • {acc.currency}</p>
                <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                  <Link href={`/dashboard/accounts/${acc.id}`} className="flex-1"><Button variant="ghost" size="sm" className="w-full">Details <ArrowRight className="w-3 h-3 ml-1" /></Button></Link>
                  {acc.status === 'ACTIVE' && <Button variant="ghost" size="sm" onClick={() => statusMutation.mutate({ id: acc.id, status: 'FROZEN' })} className="text-amber-500"><Lock className="w-3 h-3 mr-1" /> Freeze</Button>}
                  {acc.status === 'FROZEN' && <Button variant="ghost" size="sm" onClick={() => statusMutation.mutate({ id: acc.id, status: 'ACTIVE' })} className="text-emerald-500"><Unlock className="w-3 h-3 mr-1" /> Unfreeze</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
