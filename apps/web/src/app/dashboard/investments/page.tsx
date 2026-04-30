'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, TrendingUp, TrendingDown, Activity, Wallet, PieChart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockCryptoData = [
  { name: 'Bitcoin', symbol: 'BTC', price: 64230.50, change: 2.4, balance: 0.45, color: '#f59e0b' },
  { name: 'Ethereum', symbol: 'ETH', price: 3450.20, change: -1.2, balance: 4.2, color: '#6366f1' },
  { name: 'Solana', symbol: 'SOL', price: 145.80, change: 5.6, balance: 45.5, color: '#10b981' },
];

const mockStocksData = [
  { name: 'Apple Inc.', symbol: 'AAPL', price: 173.50, change: 1.2, balance: 15, color: '#a8a29e' },
  { name: 'Tesla', symbol: 'TSLA', price: 198.20, change: -3.5, balance: 10, color: '#ef4444' },
  { name: 'Nvidia', symbol: 'NVDA', price: 850.40, change: 8.4, balance: 5, color: '#22c55e' },
];

const mockChartData = [
  { date: '1W', value: 45000 },
  { date: '2W', value: 46200 },
  { date: '3W', value: 44800 },
  { date: '4W', value: 48500 },
  { date: '5W', value: 51200 },
  { date: '6W', value: 49800 },
  { date: 'Current', value: 52400 },
];

export default function InvestmentsPage() {
  const [activeTab, setActiveTab] = useState('crypto');

  const activeData = activeTab === 'crypto' ? mockCryptoData : mockStocksData;
  const totalValue = activeData.reduce((acc, asset) => acc + (asset.price * asset.balance), 0);

  return (
    <div className="space-y-6 pb-12 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Investments & Crypto</h1>
          <p className="text-muted-foreground mt-1">Manage your digital assets and portfolio.</p>
        </div>
        <div className="flex bg-muted/50 p-1.5 rounded-2xl">
          <button 
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'crypto' ? 'bg-indigo-500 text-white shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
            onClick={() => setActiveTab('crypto')}
          >
            Crypto
          </button>
          <button 
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'stocks' ? 'bg-indigo-500 text-white shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
            onClick={() => setActiveTab('stocks')}
          >
            Stocks
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 relative overflow-hidden bg-card border border-border/50 hover:shadow-lg transition-all duration-300 rounded-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full" />
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Portfolio Value</p>
                <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mt-2">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                <div className="flex items-center gap-2 mt-4">
                  <span className="flex items-center text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                    <TrendingUp className="w-4 h-4 mr-1.5" /> +$4,250.00 (8.4%)
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">Past month</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <Activity className="w-7 h-7 text-indigo-500" />
              </div>
            </div>

            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card border border-border/50 hover:shadow-lg transition-all duration-300 rounded-2xl h-full">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-6 text-foreground">Your Assets</h3>
              <div className="space-y-3">
                {activeData.map((asset, index) => (
                  <motion.div 
                    key={asset.symbol}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/40 hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: `${asset.color}15` }}>
                        {activeTab === 'crypto' ? <Bitcoin className="w-6 h-6" style={{ color: asset.color }} /> : <PieChart className="w-6 h-6" style={{ color: asset.color }} />}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-[15px]">{asset.name}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{asset.balance} {asset.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground text-[15px]">${(asset.price * asset.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className={`text-xs flex items-center justify-end gap-1 mt-1 font-bold ${asset.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {asset.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(asset.change)}%
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
