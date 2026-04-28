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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Investments & Crypto</h1>
          <p className="text-muted-foreground mt-1">Manage your digital assets and portfolio.</p>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-lg">
          <button 
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'crypto' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setActiveTab('crypto')}
          >
            Crypto
          </button>
          <button 
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'stocks' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setActiveTab('stocks')}
          >
            Stocks
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 relative overflow-hidden glassmorphism border-indigo-500/20 bg-indigo-500/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full" />
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Portfolio Value</p>
                <h2 className="text-4xl font-bold text-white mt-1">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center text-sm font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3 mr-1" /> +$4,250.00 (8.4%)
                  </span>
                  <span className="text-sm text-slate-400">Past month</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-indigo-400" />
              </div>
            </div>

            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glassmorphism bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Your Assets</h3>
              <div className="space-y-4">
                {activeData.map((asset, index) => (
                  <motion.div 
                    key={asset.symbol}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${asset.color}20` }}>
                        {activeTab === 'crypto' ? <Bitcoin className="w-5 h-5" style={{ color: asset.color }} /> : <PieChart className="w-5 h-5" style={{ color: asset.color }} />}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{asset.name}</p>
                        <p className="text-xs text-slate-400">{asset.balance} {asset.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">${(asset.price * asset.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className={`text-xs flex items-center justify-end gap-1 ${asset.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
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
