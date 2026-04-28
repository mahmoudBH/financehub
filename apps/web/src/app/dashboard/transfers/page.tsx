'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transfersApi, accountsApi } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeftRight, Send, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function TransfersPage() {
  const qc = useQueryClient();
  const [step, setStep] = useState<'form'|'confirm'|'otp'|'success'|'error'>('form');
  const [form, setForm] = useState({ sourceAccountId: '', destinationAccountId: '', amount: '', description: '' });
  const [otp, setOtp] = useState('');
  const [result, setResult] = useState<any>(null);

  const { data: accs } = useQuery({ queryKey: ['accounts'], queryFn: () => accountsApi.getAll().then(r => r.data) });
  const { data: transfers } = useQuery({ queryKey: ['transfers'], queryFn: () => transfersApi.getAll().then(r => r.data) });

  const transferM = useMutation({
    mutationFn: (d: any) => transfersApi.create(d),
    onSuccess: (res) => { setResult(res.data); setStep('success'); qc.invalidateQueries({ queryKey: ['accounts'] }); qc.invalidateQueries({ queryKey: ['transfers'] }); },
    onError: (e: any) => { toast.error(e.response?.data?.message || 'Transfer failed'); setStep('error'); },
  });

  const accounts = accs?.accounts?.filter((a: any) => a.status === 'ACTIVE') || [];
  const sourceAcc = accounts.find((a: any) => a.id === form.sourceAccountId);
  const fee = Number(form.amount) * 0.001;

  const handleSubmit = () => {
    if (!form.sourceAccountId || !form.amount || Number(form.amount) <= 0) { toast.error('Fill all required fields'); return; }
    if (sourceAcc && Number(form.amount) + fee > Number(sourceAcc.balance)) { toast.error('Insufficient balance'); return; }
    setStep('confirm');
  };

  return (
    <div className="space-y-6 animate-in">
      <div><h1 className="text-2xl font-bold">Transfers</h1><p className="text-muted-foreground mt-1">Send money between accounts</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ArrowLeftRight className="w-5 h-5" /> New Transfer</CardTitle></CardHeader>
            <CardContent>
              {step === 'form' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">From Account</label>
                    <select value={form.sourceAccountId} onChange={(e) => setForm({...form, sourceAccountId: e.target.value})} className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm">
                      <option value="">Select source account...</option>
                      {accounts.map((a: any) => (<option key={a.id} value={a.id}>{a.name} - {formatCurrency(Number(a.balance), a.currency)}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">To Account (optional - internal)</label>
                    <select value={form.destinationAccountId} onChange={(e) => setForm({...form, destinationAccountId: e.target.value})} className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm">
                      <option value="">Select destination...</option>
                      {accounts.filter((a: any) => a.id !== form.sourceAccountId).map((a: any) => (<option key={a.id} value={a.id}>{a.name} ({a.currency})</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Amount</label>
                    <Input type="number" placeholder="0.00" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} min="0.01" step="0.01" />
                    {form.amount && <p className="text-xs text-muted-foreground mt-1">Fee: {formatCurrency(fee)} • Total: {formatCurrency(Number(form.amount) + fee)}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Description (optional)</label>
                    <Input placeholder="Payment reference..." value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
                  </div>
                  <Button onClick={handleSubmit} className="w-full h-12" disabled={!form.sourceAccountId || !form.amount}><Send className="w-4 h-4 mr-2" /> Review Transfer</Button>
                </div>
              )}
              {step === 'confirm' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">From</span><span className="text-sm font-medium">{sourceAcc?.name}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Amount</span><span className="text-sm font-medium">{formatCurrency(Number(form.amount))}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Fee (0.1%)</span><span className="text-sm font-medium">{formatCurrency(fee)}</span></div>
                    <div className="border-t border-border pt-2 flex justify-between"><span className="text-sm font-semibold">Total</span><span className="text-sm font-bold">{formatCurrency(Number(form.amount) + fee)}</span></div>
                    {form.description && <div className="flex justify-between"><span className="text-sm text-muted-foreground">Note</span><span className="text-sm">{form.description}</span></div>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep('form')} className="flex-1">Back</Button>
                    <Button onClick={() => setStep('otp')} className="flex-1 bg-indigo-600 hover:bg-indigo-700">Continue</Button>
                  </div>
                </div>
              )}
              {step === 'otp' && (
                <div className="space-y-6 text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Two-Factor Authentication</h3>
                    <p className="text-muted-foreground text-sm">Please enter the 6-digit code sent to your device to authorize this transfer.</p>
                  </div>
                  <div className="max-w-[200px] mx-auto">
                    <Input 
                      type="text" 
                      placeholder="123456" 
                      maxLength={6}
                      className="text-center text-2xl tracking-widest font-mono h-14"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setStep('confirm')} className="flex-1">Cancel</Button>
                    <Button 
                      onClick={() => transferM.mutate({ 
                        sourceAccountId: form.sourceAccountId, 
                        destinationAccountId: form.destinationAccountId || undefined, 
                        amount: Number(form.amount), 
                        description: form.description 
                      })} 
                      loading={transferM.isPending} 
                      disabled={otp.length !== 6}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      Verify & Send
                    </Button>
                  </div>
                </div>
              )}
              {step === 'success' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-emerald-500" /></div>
                  <h3 className="text-xl font-bold mb-2">Transfer Successful!</h3>
                  <p className="text-muted-foreground mb-1">Reference: {result?.reference}</p>
                  <p className="text-2xl font-bold text-emerald-500 mb-6">{formatCurrency(Number(form.amount))}</p>
                  <Button onClick={() => { setStep('form'); setForm({ sourceAccountId: '', destinationAccountId: '', amount: '', description: '' }); }}>New Transfer</Button>
                </div>
              )}
              {step === 'error' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-red-500" /></div>
                  <h3 className="text-xl font-bold mb-2">Transfer Failed</h3>
                  <p className="text-muted-foreground mb-6">Something went wrong. Please try again.</p>
                  <Button onClick={() => setStep('form')}>Try Again</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transfer History */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Transfers</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(transfers?.data || []).slice(0, 8).map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center"><ArrowLeftRight className="w-4 h-4 text-indigo-500" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.description || t.reference}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(t.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(Number(t.amount))}</p>
                    <Badge variant={t.status === 'COMPLETED' ? 'success' : t.status === 'FAILED' ? 'destructive' : 'warning'} className="text-[10px]">{t.status}</Badge>
                  </div>
                </div>
              ))}
              {(!transfers?.data || transfers.data.length === 0) && <p className="text-sm text-muted-foreground text-center py-4">No transfers yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
