'use client';

import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api';
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Receipt, Search, Filter, ArrowDownLeft, ArrowUpRight, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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
                    <div className="col-span-2 text-right"><Badge variant={txn.status === 'COMPLETED' ? 'success' : txn.status === 'FAILED' ? 'destructive' : 'warning'}>{txn.status}</Badge></div>
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
    </div>
  );
}
