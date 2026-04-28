'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, TrendingUp, MoreVertical, Coins, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { vaultsApi, accountsApi } from '@/lib/api';

interface Vault {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  color: string;
  icon: string;
  isRoundUpEnabled: boolean;
  account?: { name: string; currency: string };
}

export default function VaultsPage() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [newVault, setNewVault] = useState({ name: '', targetAmount: '', accountId: '', isRoundUpEnabled: false });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vaultsRes, accountsRes] = await Promise.all([
        vaultsApi.getAll(),
        accountsApi.getAll()
      ]);
      setVaults(vaultsRes.data);
      setAccounts(accountsRes.data.accounts);
    } catch (error) {
      toast.error('Failed to load vaults');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVault = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vaultsApi.create({
        name: newVault.name,
        targetAmount: Number(newVault.targetAmount),
        accountId: newVault.accountId,
        isRoundUpEnabled: newVault.isRoundUpEnabled
      });
      toast.success('Vault created successfully!');
      setIsCreateModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create vault');
    }
  };

  const openAddFundsModal = (vaultId: string) => {
    setSelectedVaultId(vaultId);
    setFundAmount('');
    setIsAddFundsModalOpen(true);
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVaultId) return;
    const amount = Number(fundAmount);
    if (isNaN(amount) || amount <= 0) return toast.error('Invalid amount');

    try {
      await vaultsApi.addFunds(selectedVaultId, { amount });
      toast.success('Funds added successfully!');
      setIsAddFundsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add funds');
    }
  };

  const toggleRoundUp = async (vault: Vault) => {
    try {
      await vaultsApi.update(vault.id, { isRoundUpEnabled: !vault.isRoundUpEnabled });
      toast.success(vault.isRoundUpEnabled ? 'Round-up disabled' : 'Round-up enabled');
      fetchData();
    } catch (error) {
      toast.error('Failed to update round-up setting');
    }
  };

  const CircularProgress = ({ current, target, color }: { current: number; target: number; color: string }) => {
    const percentage = Math.min(100, Math.max(0, (current / target) * 100));
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center w-24 h-24">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40" cy="40" r={radius}
            className="text-slate-800"
            strokeWidth="6" stroke="currentColor" fill="transparent"
          />
          <motion.circle
            cx="40" cy="40" r={radius}
            className={`text-${color}-500`}
            strokeWidth="6" stroke="currentColor" fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-white">{Math.round(percentage)}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Smart Savings Vaults</h1>
          <p className="text-slate-400">Automate your savings with AI and Round-ups.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Vault
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-800/50 animate-pulse border border-slate-700/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaults.map((vault) => (
            <motion.div
              key={vault.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl overflow-hidden group hover:border-indigo-500/30 transition-colors"
            >
              <div className="absolute top-0 right-0 p-4">
                <button className="text-slate-500 hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl bg-${vault.color}-500/20 flex items-center justify-center`}>
                  <Target className={`w-6 h-6 text-${vault.color}-400`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{vault.name}</h3>
                  <p className="text-sm text-slate-400">{vault.account?.currency} {Number(vault.targetAmount).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <CircularProgress 
                  current={Number(vault.currentAmount)} 
                  target={Number(vault.targetAmount)} 
                  color={vault.color} 
                />
              </div>

              <div className="flex items-center justify-between mb-6 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Round-ups</p>
                    <p className="text-xs text-slate-400">Save spare change</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleRoundUp(vault)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${vault.isRoundUpEnabled ? 'bg-indigo-500' : 'bg-slate-700'}`}
                >
                  <motion.div
                    className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                    animate={{ x: vault.isRoundUpEnabled ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              <Button 
                onClick={() => openAddFundsModal(vault.id)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white"
              >
                <Coins className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-10"
            >
              <h2 className="text-xl font-bold text-white mb-6">Create New Vault</h2>
              <form onSubmit={handleCreateVault} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Vault Name</label>
                  <Input
                    required
                    value={newVault.name}
                    onChange={(e) => setNewVault({ ...newVault, name: e.target.value })}
                    placeholder="e.g. Dream Vacation"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Target Amount</label>
                  <Input
                    required
                    type="number"
                    min="1"
                    value={newVault.targetAmount}
                    onChange={(e) => setNewVault({ ...newVault, targetAmount: e.target.value })}
                    placeholder="5000"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Source Account</label>
                  <select
                    required
                    value={newVault.accountId}
                    onChange={(e) => setNewVault({ ...newVault, accountId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-md h-10 px-3"
                  >
                    <option value="" disabled>Select an account</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.currency} {Number(acc.balance).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4 mt-6 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    Create Vault
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Funds Modal */}
      <AnimatePresence>
        {isAddFundsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddFundsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-10"
            >
              <h2 className="text-xl font-bold text-white mb-6">Add Funds to Vault</h2>
              <form onSubmit={handleAddFunds} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount to Add</label>
                  <Input
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    placeholder="e.g. 50"
                    className="bg-slate-800 border-slate-700 text-white text-lg h-12"
                  />
                </div>

                <div className="flex gap-3 pt-4 mt-6 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddFundsModalOpen(false)}
                    className="flex-1 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    Confirm Deposit
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
