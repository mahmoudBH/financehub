'use client';

import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api';
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Receipt, Search, Filter, ArrowDownLeft, ArrowUpRight, RefreshCw, Download, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { splitRequestsApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const typeIcons: Record<string, any> = {
  DEPOSIT: { icon: ArrowDownLeft, color: 'text-emerald-500 bg-emerald-500/10' },
  WITHDRAWAL: { icon: ArrowUpRight, color: 'text-red-500 bg-red-500/10' },
  TRANSFER_IN: { icon: ArrowDownLeft, color: 'text-blue-500 bg-blue-500/10' },
  TRANSFER_OUT: { icon: ArrowUpRight, color: 'text-orange-500 bg-orange-500/10' },
  EXCHANGE: { icon: RefreshCw, color: 'text-purple-500 bg-purple-500/10' },
  FEE: { icon: Receipt, color: 'text-slate-500 bg-slate-500/10' },
};

export default function TransactionsPage() {
  const [filters, setFilters] = useState({ type: '', status: '', search: '', page: 1 });

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsApi.getAll({ ...filters, limit: 15 }).then(r => r.data),
  });

  const transactions = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, totalPages: 1 };

  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [splitData, setSplitData] = useState({ requestedFrom: '', amount: '' });

  const handleOpenSplit = (txn: any) => {
    setSelectedTxn(txn);
    setSplitData({ requestedFrom: '', amount: (Number(txn.amount) / 2).toString() });
    setSplitModalOpen(true);
  };

  const submitSplitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await splitRequestsApi.create({
        transactionId: selectedTxn.id,
        requestedFrom: splitData.requestedFrom,
        amount: Number(splitData.amount),
      });
      toast.success(`Split request sent to ${splitData.requestedFrom}`);
      setSplitModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create split request');
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Transactions</h1><p className="text-muted-foreground mt-1">View your transaction history</p></div>
        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Export</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search transactions..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})} className="w-full h-9 rounded-lg border border-input bg-background pl-9 pr-4 text-sm" />
            </div>
            <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value, page: 1})} className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
              <option value="">All Types</option>
              <option value="DEPOSIT">Deposit</option><option value="WITHDRAWAL">Withdrawal</option>
              <option value="TRANSFER_IN">Transfer In</option><option value="TRANSFER_OUT">Transfer Out</option>
              <option value="EXCHANGE">Exchange</option><option value="FEE">Fee</option>
            </select>
            <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})} className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
              <option value="">All Status</option>
              <option value="COMPLETED">Completed</option><option value="PENDING">Pending</option><option value="FAILED">Failed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? <div className="p-6"><TableSkeleton rows={8} /></div> : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase">
                <div className="col-span-1">Type</div><div className="col-span-3">Description</div>
                <div className="col-span-2">Reference</div><div className="col-span-2">Date</div>
                <div className="col-span-2 text-right">Amount</div><div className="col-span-2 text-right">Status</div>
              </div>
              {/* Rows */}
              {transactions.map((txn: any) => {
                const isIncome = ['DEPOSIT','TRANSFER_IN','REFUND'].includes(txn.type);
                const typeInfo = typeIcons[txn.type] || typeIcons.FEE;
                const Icon = typeInfo.icon;
                return (
                  <div key={txn.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 border-b border-border/50 hover:bg-muted/30 transition-colors items-center">
                    <div className="col-span-1"><div className={`w-9 h-9 rounded-lg flex items-center justify-center ${typeInfo.color}`}><Icon className="w-4 h-4" /></div></div>
                    <div className="col-span-3"><p className="text-sm font-medium">{txn.description || txn.type}</p><p className="text-xs text-muted-foreground md:hidden">{formatDateTime(txn.createdAt)}</p></div>
                    <div className="col-span-2 hidden md:block"><p className="text-xs text-muted-foreground font-mono">{txn.reference?.slice(0,16)}</p></div>
                    <div className="col-span-2 hidden md:block"><p className="text-sm text-muted-foreground">{formatDateTime(txn.createdAt)}</p></div>
                    <div className="col-span-2 text-right"><p className={`text-sm font-semibold ${isIncome ? 'text-emerald-500' : 'text-red-500'}`}>{isIncome ? '+' : '-'}{formatCurrency(Number(txn.amount), txn.currency)}</p></div>
                    <div className="col-span-2 text-right">
                      <Badge variant={txn.status === 'COMPLETED' ? 'success' : txn.status === 'FAILED' ? 'destructive' : 'warning'}>{txn.status}</Badge>
                      {!isIncome && txn.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleOpenSplit(txn)}
                          className="ml-3 text-muted-foreground hover:text-indigo-400 transition-colors"
                          title="Split this bill"
                        >
                          <Users className="w-4 h-4 inline" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4">
                <p className="text-sm text-muted-foreground">{meta.total} transactions • Page {meta.page} of {meta.totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => setFilters({...filters, page: filters.page - 1})}>Previous</Button>
                  <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => setFilters({...filters, page: filters.page + 1})}>Next</Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Split Request Modal */}
      <AnimatePresence>
        {splitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSplitModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Split the Bill</h2>
                <button onClick={() => setSplitModalOpen(false)} className="text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl mb-6">
                <p className="text-sm font-medium">{selectedTxn?.description}</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(Number(selectedTxn?.amount), selectedTxn?.currency)}</p>
              </div>
              <form onSubmit={submitSplitRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Who are you splitting with?</label>
                  <input required value={splitData.requestedFrom} onChange={(e) => setSplitData({...splitData, requestedFrom: e.target.value})} placeholder="Name or Email" className="w-full bg-slate-800 border border-slate-700 text-white rounded-md h-10 px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount they owe</label>
                  <input required type="number" step="0.01" max={selectedTxn?.amount} value={splitData.amount} onChange={(e) => setSplitData({...splitData, amount: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-md h-10 px-3" />
                </div>
                <div className="flex gap-3 pt-4 border-t border-slate-800">
                  <Button type="button" variant="outline" onClick={() => setSplitModalOpen(false)} className="flex-1 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800">Cancel</Button>
                  <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">Send Request</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
