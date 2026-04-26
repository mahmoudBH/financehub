'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { depositsApi, withdrawalsApi, accountsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowDownLeft, ArrowUpRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function OperationsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [form, setForm] = useState({ accountId: '', amount: '', method: 'BANK_TRANSFER', description: '' });
  const [success, setSuccess] = useState<any>(null);

  const { data: accs } = useQuery({ queryKey: ['accounts'], queryFn: () => accountsApi.getAll().then(r => r.data) });
  const accounts = accs?.accounts?.filter((a: any) => a.status === 'ACTIVE') || [];

  const depositM = useMutation({
    mutationFn: (d: any) => depositsApi.create(d),
    onSuccess: (r) => { qc.invalidateQueries({ queryKey: ['accounts'] }); setSuccess(r.data); toast.success('Deposit successful'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const withdrawM = useMutation({
    mutationFn: (d: any) => withdrawalsApi.create(d),
    onSuccess: (r) => { qc.invalidateQueries({ queryKey: ['accounts'] }); setSuccess(r.data); toast.success('Withdrawal successful'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const handleSubmit = () => {
    if (!form.accountId || !form.amount) { toast.error('Fill all fields'); return; }
    const data = { accountId: form.accountId, amount: Number(form.amount), method: form.method, description: form.description };
    if (tab === 'deposit') depositM.mutate(data); else withdrawM.mutate(data);
  };

  const reset = () => { setSuccess(null); setForm({ accountId: '', amount: '', method: 'BANK_TRANSFER', description: '' }); };

  return (
    <div className="space-y-6 animate-in">
      <div><h1 className="text-2xl font-bold">Deposit & Withdraw</h1><p className="text-muted-foreground mt-1">Simulate deposit and withdrawal operations</p></div>

      <div className="max-w-xl mx-auto">
        {/* Tab Selector */}
        <div className="flex rounded-xl bg-muted p-1 mb-6">
          <button onClick={() => { setTab('deposit'); reset(); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'deposit' ? 'bg-background shadow-sm text-emerald-500' : 'text-muted-foreground hover:text-foreground'}`}>
            <ArrowDownLeft className="w-4 h-4" /> Deposit
          </button>
          <button onClick={() => { setTab('withdraw'); reset(); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'withdraw' ? 'bg-background shadow-sm text-red-500' : 'text-muted-foreground hover:text-foreground'}`}>
            <ArrowUpRight className="w-4 h-4" /> Withdraw
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {tab === 'deposit' ? <><ArrowDownLeft className="w-5 h-5 text-emerald-500" /> Simulate Deposit</> : <><ArrowUpRight className="w-5 h-5 text-red-500" /> Simulate Withdrawal</>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-emerald-500" /></div>
                <h3 className="text-xl font-bold mb-2">{tab === 'deposit' ? 'Deposit' : 'Withdrawal'} Successful!</h3>
                <p className="text-muted-foreground mb-1">Ref: {success.reference}</p>
                <p className="text-2xl font-bold text-emerald-500 mb-6">{formatCurrency(Number(success.amount))}</p>
                <Button onClick={reset}>New Operation</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Account</label>
                  <select value={form.accountId} onChange={(e) => setForm({...form, accountId: e.target.value})} className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm">
                    <option value="">Select account...</option>
                    {accounts.map((a: any) => (<option key={a.id} value={a.id}>{a.name} - {formatCurrency(Number(a.balance), a.currency)}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Amount</label>
                  <Input type="number" placeholder="0.00" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} min="0.01" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Method</label>
                  <select value={form.method} onChange={(e) => setForm({...form, method: e.target.value})} className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm">
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    {tab === 'deposit' ? <><option value="CARD">Card</option><option value="WIRE">Wire</option></> : <><option value="ATM">ATM</option><option value="WIRE">Wire</option></>}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Description (optional)</label>
                  <Input placeholder="Add a note..." value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
                </div>
                <Button onClick={handleSubmit} className="w-full h-12" loading={depositM.isPending || withdrawM.isPending} variant={tab === 'deposit' ? 'success' : 'default'}>
                  {tab === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
