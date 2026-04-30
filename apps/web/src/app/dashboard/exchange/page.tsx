'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exchangeApi, accountsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ArrowRight, CheckCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ExchangePage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ fromAccountId: '', toAccountId: '', amount: '' });
  const [success, setSuccess] = useState<any>(null);

  const { data: accs } = useQuery({ queryKey: ['accounts'], queryFn: () => accountsApi.getAll().then(r => r.data) });
  const { data: rates } = useQuery({ queryKey: ['rates'], queryFn: () => exchangeApi.getRates().then(r => r.data), refetchInterval: 30000 });
  const { data: history } = useQuery({ queryKey: ['exchange-history'], queryFn: () => exchangeApi.getHistory().then(r => r.data) });

  const accounts = accs?.accounts?.filter((a: any) => a.status === 'ACTIVE') || [];
  const fromAcc = accounts.find((a: any) => a.id === form.fromAccountId);
  const toAcc = accounts.find((a: any) => a.id === form.toAccountId);

  const convertM = useMutation({
    mutationFn: (d: any) => exchangeApi.convert(d),
    onSuccess: (r) => { setSuccess(r.data); qc.invalidateQueries({ queryKey: ['accounts'] }); qc.invalidateQueries({ queryKey: ['exchange-history'] }); toast.success('Conversion completed'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  // Calculate preview
  let preview = { rate: 0, toAmount: 0, fee: 0 };
  if (fromAcc && toAcc && form.amount && rates?.rates) {
    const rate = rates.rates[toAcc.currency] || 1;
    const spread = 0.005;
    const effectiveRate = rate * (1 - spread);
    preview = { rate: effectiveRate, toAmount: Number(form.amount) * effectiveRate, fee: Number(form.amount) * spread };
  }

  return (
    <div className="space-y-6 animate-in pb-12">
      <div><h1 className="text-2xl md:text-3xl font-bold text-foreground">Currency Exchange</h1><p className="text-muted-foreground mt-1">Convert between currencies at competitive rates</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Live Rates */}
          {rates?.rates && (
            <Card className="bg-card border border-border/50 hover:shadow-lg transition-all duration-300 rounded-2xl">
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2 text-foreground"><TrendingUp className="w-4 h-4 text-emerald-500" /> Live Rates (EUR base)</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(rates.rates).map(([cur, rate]) => (
                    <div key={cur} className="p-4 rounded-xl bg-muted/50 text-center border border-border/40 hover:bg-muted/80 transition-colors">
                      <p className="text-lg font-bold text-foreground">{(rate as number).toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-widest">EUR → {cur}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Exchange Form */}
          <Card className="bg-card border border-border/50 hover:shadow-lg transition-all duration-300 rounded-2xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-foreground"><RefreshCw className="w-5 h-5 text-indigo-500" /> Convert Currency</CardTitle></CardHeader>
            <CardContent>
              {success ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-emerald-500" /></div>
                  <h3 className="text-2xl font-bold mb-2 text-foreground">Conversion Complete!</h3>
                  <p className="text-muted-foreground mb-6 font-mono text-xs uppercase tracking-widest">Ref: {success.reference}</p>
                  <div className="flex items-center justify-center gap-4 mb-8">
                    <span className="text-2xl font-bold text-foreground">{Number(success.fromAmount).toFixed(2)} {success.fromCurrency}</span>
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-2xl font-bold text-emerald-500">{Number(success.toAmount).toFixed(2)} {success.toCurrency}</span>
                  </div>
                  <Button onClick={() => { setSuccess(null); setForm({ fromAccountId: '', toAccountId: '', amount: '' }); }} className="rounded-xl px-8" variant="outline">New Exchange</Button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-foreground">From Account</label>
                      <select value={form.fromAccountId} onChange={(e) => setForm({...form, fromAccountId: e.target.value})} className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-primary/20">
                        <option value="">Select...</option>
                        {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({a.currency}) - {formatCurrency(Number(a.balance), a.currency)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-foreground">To Account</label>
                      <select value={form.toAccountId} onChange={(e) => setForm({...form, toAccountId: e.target.value})} className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-primary/20">
                        <option value="">Select...</option>
                        {accounts.filter((a: any) => a.id !== form.fromAccountId).map((a: any) => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-foreground">Amount</label>
                    <Input type="number" placeholder="0.00" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="h-12 rounded-xl text-lg font-medium" />
                  </div>
                  {preview.toAmount > 0 && (
                    <div className="p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Rate</span><span className="font-medium text-foreground">1 {fromAcc?.currency} = {preview.rate.toFixed(4)} {toAcc?.currency}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Fee (0.5%)</span><span className="text-foreground">{preview.fee.toFixed(2)} {fromAcc?.currency}</span></div>
                      <div className="flex justify-between text-sm font-bold border-t border-border/50 pt-3">
                        <span className="text-foreground">You'll receive</span>
                        <span className="text-emerald-500 text-lg">{preview.toAmount.toFixed(2)} {toAcc?.currency}</span>
                      </div>
                    </div>
                  )}
                  <Button onClick={() => convertM.mutate({ fromAccountId: form.fromAccountId, toAccountId: form.toAccountId, amount: Number(form.amount) })} className="w-full h-14 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-[15px]" loading={convertM.isPending} disabled={!form.fromAccountId || !form.toAccountId || !form.amount}>
                    <RefreshCw className="w-5 h-5 mr-2" /> Convert Funds
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* History */}
        <Card className="bg-card border border-border/50 hover:shadow-lg transition-all duration-300 rounded-2xl">
          <CardHeader><CardTitle className="text-base text-foreground">Exchange History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(history?.data || []).slice(0, 10).map((h: any) => (
                <div key={h.id} className="p-4 rounded-xl border border-border/40 hover:bg-muted/50 transition-colors space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-[15px] font-bold text-foreground">{Number(h.fromAmount).toFixed(2)} {h.fromCurrency}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[15px] font-bold text-emerald-500">{Number(h.toAmount).toFixed(2)} {h.toCurrency}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">Rate: {Number(h.rate).toFixed(4)}</p>
                </div>
              ))}
              {(!history?.data?.length) && <p className="text-sm text-muted-foreground text-center py-4">No exchanges yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
