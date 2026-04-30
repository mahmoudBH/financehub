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
    <div className="space-y-6 animate-in pb-12">
      <div><h1 className="text-2xl md:text-3xl font-bold text-foreground">Deposit & Withdraw</h1><p className="text-muted-foreground mt-1">Manage your funds securely</p></div>

      <div className="max-w-xl mx-auto">
        {/* Tab Selector */}
        <div className="flex rounded-2xl bg-muted/50 p-1.5 mb-8">
          <button onClick={() => { setTab('deposit'); reset(); }} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${tab === 'deposit' ? 'bg-background shadow-md text-emerald-500' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}>
            <ArrowDownLeft className="w-4 h-4" /> Deposit
          </button>
          <button onClick={() => { setTab('withdraw'); reset(); }} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${tab === 'withdraw' ? 'bg-background shadow-md text-red-500' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}>
            <ArrowUpRight className="w-4 h-4" /> Withdraw
          </button>
        </div>

        <Card className="bg-card border border-border/50 hover:shadow-lg transition-all duration-300 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              {tab === 'deposit' ? <><ArrowDownLeft className="w-5 h-5 text-emerald-500" /> Simulate Deposit</> : <><ArrowUpRight className="w-5 h-5 text-red-500" /> Simulate Withdrawal</>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
                <div className="text-center py-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${tab === 'deposit' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  <CheckCircle className={`w-10 h-10 ${tab === 'deposit' ? 'text-emerald-500' : 'text-red-500'}`} />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">{tab === 'deposit' ? 'Deposit' : 'Withdrawal'} Successful!</h3>
                <p className="text-muted-foreground mb-1 font-mono text-xs uppercase tracking-widest">Ref: {success.reference}</p>
                <p className={`text-3xl font-extrabold mb-8 ${tab === 'deposit' ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrency(Number(success.amount))}</p>
                <Button onClick={reset} className="rounded-xl px-8" variant="outline">New Operation</Button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">Account</label>
                  <select value={form.accountId} onChange={(e) => setForm({...form, accountId: e.target.value})} className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-primary/20">
                    <option value="">Select account...</option>
                    {accounts.map((a: any) => (<option key={a.id} value={a.id}>{a.name} - {formatCurrency(Number(a.balance), a.currency)}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">Amount</label>
                  <Input type="number" placeholder="0.00" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} min="0.01" step="0.01" className="h-12 rounded-xl text-lg font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">Method</label>
                  <select value={form.method} onChange={(e) => setForm({...form, method: e.target.value})} className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-primary/20">
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    {tab === 'deposit' ? <><option value="CARD">Card</option><option value="WIRE">Wire</option></> : <><option value="ATM">ATM</option><option value="WIRE">Wire</option></>}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">Description (optional)</label>
                  <Input placeholder="Add a note..." value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="h-12 rounded-xl" />
                </div>
                <Button 
                  onClick={handleSubmit} 
                  className={`w-full h-14 rounded-xl font-bold text-[15px] ${tab === 'deposit' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`} 
                  loading={depositM.isPending || withdrawM.isPending}
                >
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
