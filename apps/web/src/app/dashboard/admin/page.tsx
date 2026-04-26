'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Users, Shield, Activity, Lock, Unlock, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function AdminPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: () => adminApi.getStats().then(r => r.data) });
  const { data: usersData, isLoading } = useQuery({ queryKey: ['admin-users', search], queryFn: () => adminApi.getUsers({ search, limit: 20 }).then(r => r.data) });
  const { data: logs } = useQuery({ queryKey: ['admin-audit'], queryFn: () => adminApi.getAuditLogs({ limit: 10 }).then(r => r.data) });

  const freezeM = useMutation({ mutationFn: (id: string) => adminApi.freezeUser(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User frozen'); } });
  const unfreezeM = useMutation({ mutationFn: (id: string) => adminApi.unfreezeUser(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User unfrozen'); } });

  return (
    <div className="space-y-6 animate-in">
      <div><h1 className="text-2xl font-bold">Admin Panel</h1><p className="text-muted-foreground mt-1">System supervision and user management</p></div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-indigo-500 bg-indigo-500/10' },
          { label: 'Active', value: stats?.activeUsers || 0, icon: Activity, color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'Suspended', value: stats?.suspendedUsers || 0, icon: Lock, color: 'text-red-500 bg-red-500/10' },
          { label: 'Transactions', value: stats?.totalTransactions || 0, icon: Shield, color: 'text-purple-500 bg-purple-500/10' },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-5">
            <div className="flex items-center justify-between mb-3"><span className="text-sm text-muted-foreground">{s.label}</span><div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="w-4 h-4" /></div></div>
            <p className="text-2xl font-bold">{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Users</CardTitle>
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-48 rounded-lg border border-input bg-background pl-9 pr-3 text-sm" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? <div className="p-6"><TableSkeleton /></div> : (
                <div className="divide-y divide-border/50">
                  {(usersData?.data || []).map((u: any) => (
                    <div key={u.id} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30">
                      <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">{u.firstName?.charAt(0)}{u.lastName?.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <Badge variant={u.status === 'ACTIVE' ? 'success' : 'destructive'}>{u.status}</Badge>
                      <Badge variant="outline">{u.role}</Badge>
                      {u.status === 'ACTIVE' ? (
                        <Button variant="ghost" size="sm" onClick={() => freezeM.mutate(u.id)} className="text-red-500"><Lock className="w-3 h-3" /></Button>
                      ) : u.status === 'SUSPENDED' ? (
                        <Button variant="ghost" size="sm" onClick={() => unfreezeM.mutate(u.id)} className="text-emerald-500"><Unlock className="w-3 h-3" /></Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Audit Logs */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Audit Logs</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(logs?.data || []).map((log: any) => (
                <div key={log.id} className="p-2.5 rounded-lg bg-muted/30 space-y-1">
                  <div className="flex items-center gap-2"><Badge variant="outline" className="text-[10px]">{log.action}</Badge></div>
                  <p className="text-xs text-muted-foreground">{log.description}</p>
                  <p className="text-[10px] text-muted-foreground">{log.user?.email} • {formatDateTime(log.createdAt)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
